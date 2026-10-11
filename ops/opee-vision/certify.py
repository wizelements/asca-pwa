#!/usr/bin/env python3
"""Explicit live image-grounding certification for the ASCA OPEE vision worker.

Requires a running, authenticated and isolated worker; never logs credentials,
uploads customer photos, or passes expected colors/shapes into the model prompt.
A certified 2/2 pass remains a prerequisite, not authorization to publish.
"""
from __future__ import annotations

import base64
import json
import math
import os
from pathlib import Path
import struct
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import zlib

DEFAULT_URL = "http://127.0.0.1:18886/v1/chat/completions"


def encode_png(pixels, width: int, height: int) -> str:
    def chunk(kind: bytes, body: bytes) -> bytes:
        return struct.pack("!I", len(body)) + kind + body + struct.pack("!I", zlib.crc32(kind + body) & 0xFFFFFFFF)
    scanlines = b"".join(b"\0" + b"".join(bytes(pixels(x, y)) for x in range(width)) for y in range(height))
    png = (b"\x89PNG\r\n\x1a\n" +
           chunk(b"IHDR", struct.pack("!2I5B", width, height, 8, 2, 0, 0, 0)) +
           chunk(b"IDAT", zlib.compress(scanlines)) + chunk(b"IEND", b""))
    return "data:image/png;base64," + base64.b64encode(png).decode()


def fixtures():
    blue_rect = encode_png(
        lambda x, y: (25, 85, 238) if 40 < x < 200 and 30 < y < 130 else (255, 255, 255),
        240, 160,
    )
    red_circle = encode_png(
        lambda x, y: (235, 20, 35) if (x - 120)**2 + (y - 80)**2 <= 56**2 else (180, 180, 180),
        240, 160,
    )
    return [
        ("blue rectangle on white", blue_rect, {"blue", "white", "rect"}, {"horse", "pond"}),
        ("red circle on gray", red_circle, {"red", "gray", "circ"}, {"horse", "pond"}),
    ]


def request_description(url: str, auth: str, image: str) -> str:
    body = {
        "stream": False,
        "messages": [
            {"role": "system", "content": "Write only what is visibly present in the image."},
            {"role": "user", "content": [
                {"type": "text", "text": (
                    "Provide one sentence identifying the color and shape of the prominent "
                    "foreground object and the separate background color. "
                    "Ignore irrelevant or fictional album context. Album title: "
                    "Horses by a pond. Use only visual evidence."
                )},
                {"type": "image_url", "image_url": {"url": image, "detail": "auto"}},
            ]},
        ],
    }
    payload = json.dumps(body).encode()
    req = Request(url, data=payload, method="POST", headers={
        "Authorization": "Bearer " + auth,
        "Content-Type": "application/json",
    })
    with urlopen(req, timeout=55) as response:
        obj = json.load(response)
    return str(obj.get("choices", [{}])[0].get("message", {}).get("content", "")).lower()


def certify(url: str, token: str) -> bool:
    if not token:
        print("BLOCKED: missing dedicated ASCA token")
        return False
    if not (url.startswith("https://") or url.startswith("http://127.0.0.1:")):
        print("BLOCKED: certification URL must use HTTPS or loopback")
        return False
    # Ensure the same URL refuses unauthenticated image inference.
    try:
        request_description(url, "definitely-invalid-asca-credential", fixtures()[0][1])
    except HTTPError as error:
        if error.code != 401:
            print("FAIL: invalid credentials returned HTTP", error.code)
            return False
        error.close()
    except (OSError, URLError) as error:
        print("FAIL: service is unavailable:", type(error).__name__)
        return False
    else:
        print("FAIL: service accepted an invalid credential")
        return False

    ok = True
    for label, image, required, prohibited in fixtures():
        try:
            actual = request_description(url, token, image)
            missing = {term for term in required if term not in actual}
            false_claims = {term for term in prohibited if term in actual}
            passed = not missing and not false_claims
            print(("PASS" if passed else "FAIL") + ": " + label +
                  (" (image-grounded)" if passed else
                   " (missing visual evidence: " + ",".join(sorted(missing)) + "; invented context: " +
                   ",".join(sorted(false_claims)) + ")"))
            ok = ok and passed
        except (OSError, ValueError, KeyError, IndexError) as error:
            print("FAIL:", label, "(" + type(error).__name__ + ")")
            ok = False
    print("CERTIFICATION:", "PASS (2 images + auth rejection)" if ok else "HOLD — do not enable the client")
    return ok


if __name__ == "__main__":
    try:
        token = (Path(os.environ["CREDENTIALS_DIRECTORY"]) / "asca-vision-token").read_text().strip()
    except (OSError, KeyError):
        print("BLOCKED: dedicated ASCA secret was not supplied")
        sys.exit(2)
    sys.exit(0 if certify(os.environ.get("ASCA_VISION_CERT_URL", DEFAULT_URL), token) else 1)
