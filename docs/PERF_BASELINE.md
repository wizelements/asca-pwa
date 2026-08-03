# Performance Baseline

Captured 2026-07-22T02:09:47.309Z against `http://localhost:3000`, using Node's fetch on the machine running this script (5 requests per route). This is a local/server-response baseline, not a browser Core Web Vitals measurement.

| Route | Status | Median TTFB | Median total | HTML size | Cache-Control | ETag |
|---|---:|---:|---:|---:|:---:|:---:|
| `/` | 200 | 22.7 ms | 30.7 ms | 66.1 KB | Yes | No |
| `/gallery` | 200 | 18.8 ms | 23.9 ms | 54.3 KB | Yes | No |
| `/horses` | 404 | 11.4 ms | 14.6 ms | 17.5 KB | Yes | No |

## Budgets

- Median local HTML TTFB: **< 500 ms**.
- HTML response size: **< 100 KB** per route.
- Images: served with cache headers (validate separately against image responses).
