// Resolves the tsconfig "@/*" path alias for plain-node test runs.
// Registered via tests/register.mjs; production code is untouched.
import { statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, nextResolve) {
  // Next.js resolves this server-component guard during application builds.
  // Standalone Node tests need a no-op guard, not the browser-only error module.
  if (specifier === 'server-only') return { url: 'data:text/javascript,', shortCircuit: true };
  if (specifier.startsWith('@/')) {
    const base = join(root, specifier.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
      if (isFile(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }
  if (specifier.startsWith('next/')) {
    try {
      return nextResolve(`${specifier}.js`, context);
    } catch {}
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  return nextLoad(url, context);
}
