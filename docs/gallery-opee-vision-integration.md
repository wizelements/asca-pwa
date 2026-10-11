# ASCA Gallery — OPEE-first image descriptions

## Confirmed interface

ASCA calls OPEE, not OpenAI. Hermes, which runs within the OPEE system on `opee-core`, supports authenticated multimodal requests to `POST /v1/chat/completions` with a `data:image/...;base64` `image_url` input. It selects its own model from the configured OPEE route when `model` is omitted.

**This is an integration implementation, not production certification.** The local gateway is only reachable over private interfaces at inspection time. The preview has no confirmed HTTPS ASCA-to-OPEE ingress. A working vision model, constrained credential, and image-data authorization must be verified before enabling real requests.

## Server-only configuration

Set in ASCA's Vercel project:

- `OPEE_ASCA_VISION_URL`: HTTPS endpoint ending in `/v1/chat/completions`, provided by an authorized OPEE image-analysis ingress.
- `OPEE_ASCA_VISION_TOKEN`: a dedicated token scoped to the ASCA gallery image-description route. Never use a full OPEE administrator, emergency stop, dispatcher, shell execution, or production promotion token.

The site has **no direct OpenAI API integration** for gallery descriptions and no automatic OpenAI fallback. A missing/unhealthy OPEE route produces a client-friendly error with manual descriptions still available.

## Production ingress requirements

1. Put a dedicated allowlisted reverse proxy or API adapter in front of Hermes, restricted to one route `POST /v1/chat/completions`, the ASCA application principal, bounded image requests, and a vision-only OPEE agent profile. The proxy must prohibit tool execution, shell access, task mutation, remote command, session continuation, browser control, administrative endpoints, and unintended provider fallback.
2. Use HTTPS, request-size limits, per-principal rate limits, no request-body logging, image retention limits, audit identifiers and secret rotation. Private gateways must **not** be placed openly on the Internet or granted elevated credentials to Vercel.
3. OPEE must verify the selected model actually supports vision and can return grounded descriptions; refuse any non-vision model instead of fabricating a description from the album title. Test with a synthetic image, unrelated album title, failure responses, and prompt injection contained in images/album context.
4. Do not automatically approve privacy or release unpublished photos to any external model without an authorized disclosure policy. EXIF and location metadata are stripped before a request. The admin UI explains processing and preserves staff review.
5. Preserve `draft`/privacy status, prevent overwriting existing staff descriptions, and keep the client error/recovery path. Check no duplicate albums after failed saves.

## Release proof

- Vercel build success on the branch
- GitHub gallery API tests for unauthorized clients, unconfigured OPEE, invalid non-HTTPS URL, OPEE response, no direct OpenAI call, no privacy status mutation
- Playwright gallery flow and human-checked alt text from a real authorized image
- OPEE gateway model-support and constrained ingress proof under appropriate governance
- Production promotion only after review of all of the above

Source: `app/api/gallery/describe/route.ts`. Work branch: `fix/gallery-album-review-upload-20261011`; PR #15.