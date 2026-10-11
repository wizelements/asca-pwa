# ASCA Gallery — OPEE-first image descriptions

## Confirmed interface

ASCA calls OPEE, not OpenAI. The dedicated OPEE ASCA vision-only worker (ops/opee-vision/server.py) accepts authenticated image requests in Hermes-compatible format. It has **no agent tools** and routes only to OPEE's selected Ollama Cloud vision model (gemma4:31b by default). The ordinary public Hermes gateway has broader execution capabilities and must NOT be exposed to ASCA.

**This is an integration implementation, not production certification.** The local gateway is only reachable over private interfaces at inspection time. The preview has no confirmed HTTPS ASCA-to-OPEE ingress. A working vision model, constrained credential, and image-data authorization must be verified before enabling real requests.

## Server-only configuration

Set in ASCA's Vercel project:

- `OPEE_ASCA_VISION_URL`: HTTPS endpoint ending in `/v1/chat/completions`, provided by an authorized OPEE image-analysis ingress.
- `OPEE_ASCA_VISION_TOKEN`: a dedicated token scoped to the ASCA gallery image-description route. Never use a full OPEE administrator, emergency stop, dispatcher, shell execution, or production promotion token.

The site has **no direct OpenAI API integration** for gallery descriptions and no automatic OpenAI fallback. A missing/unhealthy OPEE route produces a client-friendly error with manual descriptions still available.

## Production ingress requirements

1. Deploy the separate OPEE image-only service and forward the exact HTTPS path to it, never to the main Hermes gateway. It must accept only `POST /v1/chat/completions`, bounded photo inputs and the dedicated ASCA principal. The service prohibits tool execution, shell access, task mutation, remote command, session continuation, browser control, administrative endpoints, and unintended provider fallback.
2. Use HTTPS, request-size limits, per-principal rate limits, no request-body logging, image retention limits, audit identifiers and secret rotation. Private gateways must **not** be placed openly on the Internet or granted elevated credentials to Vercel.
3. OPEE must verify the selected model actually supports vision and can return grounded descriptions; refuse any non-vision model instead of fabricating a description from the album title. Test with a synthetic image, unrelated album title, failure responses, and prompt injection contained in images/album context.
4. Do not automatically approve privacy or release unpublished photos to any external model without an authorized disclosure policy. EXIF and location metadata are stripped before a request. The admin UI explains processing and preserves staff review.
5. Preserve `draft`/privacy status, prevent overwriting existing staff descriptions, and keep the client error/recovery path. Check no duplicate albums after failed saves.


## Deployment gate — not yet executed

- On OPEE core, six local HTTP/security worker tests passed. The Caddy route proposed in ops/opee-vision/caddy-snippet.caddy passed a temporary `caddy adapt` check. These are mock-model tests, not a real authorized gallery photo test.
- The current OPEE account lacks sudo authority (`sudo -n true` was denied). Therefore the root-owned Caddy and systemd service configuration has NOT been modified, and there is no certified public OPEE vision endpoint yet.
- An authorized root administrator must install `ops/opee-vision/server.py` at `/opt/opee/asca-vision/server.py`, load `ops/opee-vision/asca-vision.service` using systemd, and place a newly generated ASCA-only token and dedicated Ollama Cloud API key in root-owned `/etc/opee/asca-vision/` files with mode 0600. Never reuse the Hermes/dispatcher/SSH administrator credentials.
- Systemd `LoadCredential` passes the keys privately to a DynamicUser vision worker. The service only binds 127.0.0.1:18886. The approved root operator adds the exact-path proxy snippet inside the existing HTTPS Caddy site and validates/reloads Caddy.
- After the service is healthy, configure Vercel Preview with `OPEE_ASCA_VISION_URL=https://209-94-58-167.sslip.io/asca-vision/v1/chat/completions` and a server-only `OPEE_ASCA_VISION_TOKEN` matching the new *scoped* service token. Redeploy the preview, then exercise an actual synthetic image, incorrect album context, invalid token, and a real explicitly authorized album photo.
- OPEE currently selects Ollama Cloud with a Gemma 4 vision model; this means gallery photos may be processed by an external cloud model even though OPEE controls the request. The admin UI discloses this. Obtain permissions before sending unpublished photos for analysis.
- Until the server, credentials, model outputs, privacy authorization, and preview upload-to-render exercise are verified, keep PR #15 unmerged and production unchanged.

## Installation and test artifacts

- `ops/opee-vision/server.py`: isolated no-tools image worker
- `ops/opee-vision/test_server.py`: unauthorized, malformed, command injection, size and rate-limit regression tests
- `ops/opee-vision/asca-vision.service`: least-privilege systemd unit template with separate credentials
- `ops/opee-vision/caddy-snippet.caddy`: exact-path HTTPS ingress template, without modifying other OPEE routes
- `.github/workflows/e2e.yml`: integration test gate
## Visual grounding incident and mandatory certification (October 11, 2026)

A live Hermes CLI test with a valid synthetic PNG returned an incorrect description. The verified PNG has white corners (255,255,255) and a blue rectangular center (25,85,238). Hermes's configured gemma4:31b Ollama Cloud route described a solid blue background and missed the white border in two requests. The cause may be a multimodal transport defect or model perception error; it is not verified. Vision model metadata and API health are not sufficient to certify accuracy.

The dedicated image worker now pins cloud-qualified allowlisted vision identifiers (default gemma4:31b-cloud; optional qwen3-vl:235b-cloud). Direct worker-to-cloud image analysis has NOT been tested with real service credentials.

Once an authorized operator installs the service and its secrets, run the Python file ops/opee-vision/certify.py using the systemd CREDENTIALS_DIRECTORY service secrets. Do not paste the secrets into commands, logs or chat.

The certification script rejects invalid bearer credentials, evaluates a synthetic blue rectangle with a white background and a red circle on a gray background, includes a deliberately false album title (horses by a pond), and fails closed unless BOTH output descriptions show the visible colors and shape without invented horses or pond. A live 2/2 PASS and human inspection of a permitted real album image are mandatory before setting Vercel Preview OPEE_ASCA_VISION_URL / OPEE_ASCA_VISION_TOKEN.

On a failed visual test, hold activation, investigate multimodal forwarding and/or select another approved vision model. Do not silently fall back to OpenAI or mark the gallery AI complete.
## Release proof

- Vercel build success on the branch
- GitHub gallery API tests for unauthorized clients, unconfigured OPEE, invalid non-HTTPS URL, OPEE response, no direct OpenAI call, no privacy status mutation
- Playwright gallery flow and human-checked alt text from a real authorized image
- OPEE gateway model-support and constrained ingress proof under appropriate governance
- Production promotion only after review of all of the above

Source: `app/api/gallery/describe/route.ts`. Work branch: `fix/gallery-album-review-upload-20261011`; PR #15.
## Hermes native image-routing repair (October 11, 2026)

- An independently isolated Hermes branch fixed the Ollama Cloud model suffix lookup: the unrecognized gemma4:31b-cloud ID previously fell back to a non-native file-analysis path instead of passing image bytes to the vision model.
- The fix checks the exact model ID first, then (only if unknown and provider is ollama-cloud) consults the trusted catalog metadata for the unsuffixed model. Unrecognized or explicitly disabled vision models still fail closed.
- **Live evidence:** two synthetic image requests through the patched Hermes worktree correctly identified blue rectangle/white background and red circle/gray background; the second request included a misleading horse-and-pond album title.
- **Patch:** https://github.com/wizelements/opee/pull/9 (draft, unmerged). Local Hermes commit 530affadb25bdc7e1867026d276b6c3cff2a504d. This does not modify the production Hermes gateway.
- Four new regression tests passed. Two unrelated WebP/llama.cpp tests also failed in the pre-existing checkout when executed as part of the same larger test sequence; see OPEE PR for comparison.
- The dedicated ASCA OPEE vision-only web worker is a separate component. Its real public HTTPS ingress, dedicated service credentials, and live worker-to-model caption certification remain unverified. **Do not present the Hermes CLI test as end-to-end ASCA integration.**
