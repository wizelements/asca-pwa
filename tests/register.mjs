// Usage: node --experimental-strip-types --import ./tests/register.mjs <test-file>
import { register } from 'node:module';

register('./alias-loader.mjs', import.meta.url);
