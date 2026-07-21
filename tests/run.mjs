import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { globSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const files = globSync('tests/**/*.test.mjs', { cwd: root }).map(f => fileURLToPath(new URL('../tests/' + f.split('/').slice(1).join('/'), import.meta.url)));

run({ files })
  .on('test:fail', (data) => {
    console.error('FAIL', data.name);
  })
  .compose(spec)
  .pipe(process.stdout);
