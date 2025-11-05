import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

(globalThis as Record<string, unknown>).ASTRO_BASE_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..'
);
