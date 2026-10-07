# Security Policy

## Scope

ASCA is a client-facing PWA with authenticated administrative workflows and persistent operational data. Reports involving admin authorization, session handling, data integrity, public input, media management, backups/restores, or customer/member information are security-sensitive.

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials, private member information, or other sensitive data.

Preferred reporting path:

1. Use GitHub's private security-advisory flow for this repository when enabled.
2. Otherwise email **contact@cod3blackagency.com** with `SECURITY — ASCA` in the subject.

Include the affected route/surface, potential impact, reproduction steps, and only the minimum evidence needed to verify the issue.

## Security invariants

Consequential changes should preserve and verify:

- server-side admin authorization on protected APIs;
- HttpOnly session handling;
- strong production signing secrets;
- bounded/sanitized public input;
- least-privilege external-service credentials;
- database integrity across migrations and restore operations;
- no production credentials or member data in source control;
- safe failure behavior for writes and destructive operations;
- HTTPS on public production deployments.

UI visibility is not authorization, and offline/PWA behavior must not become an authoritative path for administrative writes.

## Disclosure

Please allow the maintainers to reproduce and address a verified vulnerability before public disclosure. Remediation priority is based on severity, exploitability, affected users/data, and production exposure.
