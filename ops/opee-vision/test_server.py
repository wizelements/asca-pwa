"""No-network security regression tests for the OPEE ASCA image-only worker."""
import base64
from contextlib import contextmanager
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from server import ACTIVE, ATTEMPTS, Handler, vision_request

PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
AUTH = "s" * 48
PROMPT = "Describe the photo for the ASCA trail ride album."
BODY = {
    "stream": False,
    "messages": [
        {"role": "system", "content": "Untrusted caller-supplied system instructions must be ignored."},
        {"role": "user", "content": [
            {"type": "text", "text": PROMPT},
            {"type": "image_url", "image_url": {"url": "data:image/png;base64," + PNG}},
        ]},
    ],
}


@contextmanager
def running():
    with patch("server.credentials", return_value=(AUTH, "o" * 48)):
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            yield "http://127.0.0.1:" + str(server.server_port)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=3)


def post(url: str, body: dict, *, auth=AUTH, path="/v1/chat/completions"):
    req = Request(url + path, method="POST", data=json.dumps(body).encode("utf-8"),
                  headers={"Content-Type": "application/json",
                           "Authorization": "Bearer " + auth})
    try:
        with urlopen(req, timeout=3) as response:
            return response.status, json.load(response)
    except HTTPError as response:
        return response.code, json.load(response)


class VisionWorkerTests(unittest.TestCase):
    def setUp(self):
        with __import__("server").LOCK:
            ATTEMPTS.clear()

    def test_only_authorized_image_requests_reach_model(self):
        with running() as url, patch("server.send_ollama", return_value="People stand beside two horses on a grassy field.") as model:
            status, _ = post(url, BODY, auth="wrong")
            self.assertEqual(status, 401)
            status, _ = post(url, BODY, path="/v1/runs")
            self.assertEqual(status, 404)
            status, result = post(url, BODY)
            self.assertEqual(status, 200)
            self.assertIn("People stand", result["choices"][0]["message"]["content"])
            self.assertEqual(model.call_count, 1)
            self.assertEqual(model.call_args.args[0], PROMPT)
            self.assertEqual(model.call_args.args[1], PNG)

    def test_agent_capabilities_and_arbitrary_models_are_denied(self):
        with running() as url, patch("server.send_ollama") as model:
            payload = dict(BODY, tools=[{"type": "function", "function": {"name": "run_shell"}}])
            status, _ = post(url, payload)
            self.assertEqual(status, 400)
            payload = dict(BODY, model="administrator-model")
            status, _ = post(url, payload)
            self.assertEqual(status, 400)
            payload = dict(BODY, stream=True)
            status, _ = post(url, payload)
            self.assertEqual(status, 400)
            self.assertEqual(model.call_count, 0)

    def test_invalid_image_rejected_without_inference(self):
        with running() as url, patch("server.send_ollama") as model:
            payload = json.loads(json.dumps(BODY))
            payload["messages"][1]["content"][1]["image_url"]["url"] = "data:image/png;base64,YWJj"
            status, _ = post(url, payload)
            self.assertEqual(status, 400)
            self.assertEqual(model.call_count, 0)

    def test_auth_required_before_parsing(self):
        with running() as url:
            request = Request(url + "/v1/chat/completions", method="POST", data=b"{broken",
                              headers={"Content-Type": "application/json"})
            with self.assertRaises(HTTPError) as caught:
                urlopen(request, timeout=3)
            self.assertEqual(caught.exception.code, 401)

    def test_no_inference_when_provider_fails(self):
        from urllib.error import URLError
        with running() as url, patch("server.send_ollama", side_effect=URLError("unavailable")):
            status, result = post(url, BODY)
            self.assertEqual(status, 503)
            self.assertEqual(result["error"]["message"], "OPEE vision analysis is temporarily unavailable.")

    def test_cloud_provider_model_is_restricted(self):
        from io import BytesIO
        from server import send_ollama
        body = json.dumps({"message": {"content": "A blue rectangle on a white background."}}).encode()
        with patch("server.urlopen") as transport:
            transport.return_value.__enter__.return_value = BytesIO(body)
            with patch.dict("server.os.environ", {"OPEE_VISION_MODEL": "gemma4:31b-cloud"}):
                answer = send_ollama("Describe this picture.", PNG, "provider-token-never-logged")
            self.assertIn("blue rectangle", answer)
            sent = json.loads(transport.call_args.args[0].data)
            self.assertEqual(sent["model"], "gemma4:31b-cloud")
            self.assertEqual(sent["messages"][1]["images"], [PNG])
            self.assertFalse(sent["messages"][0].get("tools"))
            transport.reset_mock()
            with patch.dict("server.os.environ", {"OPEE_VISION_MODEL": "unapproved-text-only-model"}):
                with self.assertRaises(ValueError):
                    send_ollama("Describe.", PNG, "provider-token-never-logged")
            transport.assert_not_called()

    def test_certification_rejects_vision_hallucination_and_accepts_grounded_output(self):
        from certify import certify
        from urllib.error import HTTPError
        with patch("certify.request_description") as infer:
            infer.side_effect = [
                HTTPError("http://127.0.0.1:18886/v1/chat/completions", 401,
                          "unauthorized", {}, None),
                "A solid blue background fills the frame.",
                "A red circle on a grey background.",
            ]
            self.assertFalse(certify("http://127.0.0.1:18886/v1/chat/completions", "synthetic"))
            self.assertEqual(infer.call_count, 3)
        with patch("certify.request_description") as infer:
            infer.side_effect = [
                HTTPError("http://127.0.0.1:18886/v1/chat/completions", 401,
                          "unauthorized", {}, None),
                "A blue rectangle on a white background.",
                "A red circle on a gray background.",
            ]
            self.assertTrue(certify("http://127.0.0.1:18886/v1/chat/completions", "synthetic"))

    def test_rate_limit_is_bounded(self):
        with running() as url, patch("server.send_ollama", return_value="A brown horse stands near a fence.") as model:
            with __import__("server").LOCK:
                ATTEMPTS.extend([__import__("time").monotonic()] * 12)
            status, _ = post(url, BODY)
            self.assertEqual(status, 429)
            self.assertEqual(model.call_count, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
