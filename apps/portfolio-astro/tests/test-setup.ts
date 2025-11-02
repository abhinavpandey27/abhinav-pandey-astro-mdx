import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

globalThis.ASTRO_BASE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
