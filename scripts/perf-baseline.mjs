import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const runs = Math.max(1, Number.parseInt(process.env.N || '5', 10));

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function fetchTimed(route) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'follow' });
  const headersAt = performance.now();
  const body = await response.arrayBuffer();
  const finished = performance.now();
  return {
    status: response.status,
    ttfb: headersAt - started,
    total: finished - started,
    bytes: body.byteLength,
    cache: Boolean(response.headers.get('cache-control')),
    etag: Boolean(response.headers.get('etag')),
    html: new TextDecoder().decode(body),
  };
}

function firstDetail(html, prefix) {
  const escaped = prefix.replaceAll('/', '\\/');
  const match = html.match(new RegExp(`href=["'](${escaped}[^"'?#/]+)["']`));
  return match?.[1];
}

const routes = ['/', '/gallery', '/horses'];
for (const listing of ['/gallery', '/horses']) {
  try {
    const sample = await fetchTimed(listing);
    const detail = sample.status === 200 ? firstDetail(sample.html, `${listing}/`) : undefined;
    if (detail) routes.push(detail);
  } catch (error) {
    console.error(`Discovery skipped for ${listing}: ${error.message}`);
  }
}

const results = [];
for (const route of [...new Set(routes)]) {
  const samples = [];
  for (let index = 0; index < runs; index += 1) samples.push(await fetchTimed(route));
  results.push({
    route,
    status: samples[0].status,
    ttfb: median(samples.map((item) => item.ttfb)),
    total: median(samples.map((item) => item.total)),
    bytes: median(samples.map((item) => item.bytes)),
    cache: samples.some((item) => item.cache),
    etag: samples.some((item) => item.etag),
  });
}

const table = [
  '| Route | Status | Median TTFB | Median total | HTML size | Cache-Control | ETag |',
  '|---|---:|---:|---:|---:|:---:|:---:|',
  ...results.map((item) => `| \`${item.route}\` | ${item.status} | ${item.ttfb.toFixed(1)} ms | ${item.total.toFixed(1)} ms | ${(item.bytes / 1024).toFixed(1)} KB | ${item.cache ? 'Yes' : 'No'} | ${item.etag ? 'Yes' : 'No'} |`),
].join('\n');

const document = `# Performance Baseline\n\nCaptured ${new Date().toISOString()} against \`${baseUrl}\`, using Node's fetch on the machine running this script (${runs} requests per route). This is a local/server-response baseline, not a browser Core Web Vitals measurement.\n\n${table}\n\n## Budgets\n\n- Median local HTML TTFB: **< 500 ms**.\n- HTML response size: **< 100 KB** per route.\n- Images: served with cache headers (validate separately against image responses).\n`;

console.log(table);
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/PERF_BASELINE.md', import.meta.url), document);
