#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import process from 'node:process';
import { globby } from 'globby';
import sharp from 'sharp';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const MEDIA_ROOT = path.join(APP_ROOT, 'public', 'media');
const CACHE_PATH = path.join(APP_ROOT, '.media-optim-cache.json');
const MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_QUALITY = 80;
const MIN_QUALITY = 40;

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

function normaliseRelative(filePath) {
  return filePath.split(path.sep).join('/');
}

async function readJSONSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    force: false,
    dryRun: false,
    paths: []
  };

  while (args.length) {
    const arg = args.shift();
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg?.startsWith('-')) {
      console.warn(pc.yellow(`Ignoring unknown flag ${arg}`));
    } else if (arg) {
      options.paths.push(arg);
    }
  }

  return options;
}

async function getTargetFiles(options, mediaRoot) {
  if (options.paths.length) {
    const expanded = await globby(
      options.paths.map((p) => path.resolve(p)),
      { onlyFiles: true, followSymbolicLinks: false }
    );
    return expanded;
  }

  return await globby(
    [
      path.join(mediaRoot, '**/*.{png,jpg,jpeg}'),
      path.join(mediaRoot, '**/*.webp'),
      path.join(mediaRoot, '**/*.avif')
    ],
    { onlyFiles: true, followSymbolicLinks: false }
  );
}

function buildCacheKey(publicPath) {
  return publicPath;
}

function loadCacheEntries(cache, key) {
  if (!cache.entries) cache.entries = {};
  return cache.entries[key];
}

function setCacheEntries(cache, key, stat) {
  cache.entries[key] = {
    mtimeMs: stat.mtimeMs,
    size: stat.size
  };
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function replaceReferences(root, fromPath, toPath, contentGlobs) {
  const replacements = [];
  const searchPatterns = [
    normaliseRelative(fromPath),
    normaliseRelative(`../${fromPath}`)
  ];
  const replacementPatterns = [
    normaliseRelative(toPath),
    normaliseRelative(`../${toPath}`)
  ];

  const files = await globby(contentGlobs, {
    cwd: root,
    absolute: true,
    followSymbolicLinks: false
  });

  await Promise.all(
    files.map(async (file) => {
      let contents = await fs.readFile(file, 'utf8');
      let changed = false;
      searchPatterns.forEach((pattern, index) => {
        if (contents.includes(pattern)) {
          contents = contents.split(pattern).join(replacementPatterns[index]);
          changed = true;
        }
      });

      if (changed) {
        await fs.writeFile(file, contents, 'utf8');
        replacements.push(file);
      }
    })
  );

  return replacements;
}

async function optimiseBuffer(buffer, options) {
  let quality = options.quality ?? DEFAULT_QUALITY;
  let outputBuffer;
  let lastError;
  while (quality >= (options.minQuality ?? MIN_QUALITY)) {
    try {
      outputBuffer = await sharp(buffer).webp({ quality }).toBuffer();
    } catch (error) {
      lastError = error;
      break;
    }
    if (outputBuffer.length <= options.maxBytes) {
      return { buffer: outputBuffer, quality };
    }
    quality -= 5;
  }

  if (!outputBuffer) {
    throw lastError ?? new Error('Failed to optimise image');
  }

  return { buffer: outputBuffer, quality };
}

function isWithinDir(target, dir) {
  const relative = path.relative(dir, target);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

export async function processImage({
  filePath,
  appRoot = APP_ROOT,
  mediaRoot = MEDIA_ROOT,
  cache,
  options,
  contentGlobs
}) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return { status: 'skipped', reason: 'unsupported-extension', filePath };
  }

  if (!isWithinDir(filePath, mediaRoot)) {
    return { status: 'skipped', reason: 'outside-media-root', filePath };
  }

  const stat = await fs.stat(filePath);
  const relative = normaliseRelative(path.relative(mediaRoot, filePath));
  const publicPath = `/media/${relative}`;
  const cacheKey = buildCacheKey(publicPath);

  if (!options.force) {
    const cached = loadCacheEntries(cache, cacheKey);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return { status: 'skipped', reason: 'cached', filePath };
    }
  }

  if (options.dryRun) {
    return { status: 'dry-run', originalBytes: stat.size, filePath };
  }

  const inputBuffer = await fs.readFile(filePath);
  let outputExt = ext === '.webp' ? '.webp' : '.webp';
  const { buffer: outputBuffer, quality } = await optimiseBuffer(inputBuffer, {
    maxBytes: options.maxBytes ?? MAX_BYTES,
    quality: options.quality ?? DEFAULT_QUALITY,
    minQuality: options.minQuality ?? MIN_QUALITY
  });

  const originalBytes = inputBuffer.length;
  const outputBytes = outputBuffer.length;

  let outputPath = filePath;
  let renamed = false;
  if (ext !== '.webp') {
    const base = path.basename(filePath, ext);
    outputPath = path.join(path.dirname(filePath), `${base}${outputExt}`);
    renamed = outputPath !== filePath;
  }

  await ensureDir(outputPath);
  await fs.writeFile(outputPath, outputBuffer);

  const outputRelative = normaliseRelative(path.relative(mediaRoot, outputPath));
  const outputPublicPath = `/media/${outputRelative}`;

  if (renamed) {
    await fs.unlink(filePath);
    await replaceReferences(appRoot, `/media/${relative}`, outputPublicPath, contentGlobs);
    await replaceReferences(appRoot, `../media/${relative}`, `../media/${outputRelative}`, contentGlobs);
  }

  const newStat = await fs.stat(outputPath);
  delete cache.entries?.[cacheKey];
  setCacheEntries(cache, outputPublicPath, newStat);

  return {
    status: 'optimized',
    filePath: renamed ? outputPath : filePath,
    originalBytes,
    outputBytes,
    quality,
    renamed,
    outputPublicPath
  };
}

export async function optimizeMedia({ appRoot = APP_ROOT, mediaRoot = MEDIA_ROOT, force = false, dryRun = false, paths = [] } = {}) {
  const options = { force, dryRun };
  const cache = (await readJSONSafe(CACHE_PATH)) ?? { version: 1, entries: {} };
  const contentGlobs = [
    path.join(appRoot, 'src', 'content', '**/*.{md,mdx,json}'),
    path.join(appRoot, 'src', '**/*.{astro,ts,tsx,js,jsx}')
  ];

  const files = await getTargetFiles({ paths }, mediaRoot);
  if (files.length === 0) {
    console.log(pc.yellow('No media files found to optimise.'));
    return { processed: [], cache };
  }

  const processed = [];
  for (const file of files) {
    try {
      const result = await processImage({
        filePath: file,
        appRoot,
        mediaRoot,
        cache,
        options,
        contentGlobs
      });
      processed.push(result);
      logResult(result);
    } catch (error) {
      processed.push({ status: 'error', filePath: file, error });
      console.error(pc.red(`✖ Failed to optimise ${path.basename(file)} – ${error.message}`));
    }
  }

  if (!dryRun) {
    await writeJSON(CACHE_PATH, cache);
  }

  const optimizedCount = processed.filter((item) => item.status === 'optimized').length;
  const skippedCount = processed.filter((item) => item.status === 'skipped').length;
  const errorCount = processed.filter((item) => item.status === 'error').length;

  console.log(
    pc.bold(
      `Summary: ${pc.green(`${optimizedCount} optimised`)} · ${pc.yellow(
        `${skippedCount} skipped`
      )} · ${errorCount ? pc.red(`${errorCount} errors`) : pc.green('0 errors')}`
    )
  );

  return { processed, cache };
}

function logResult(result) {
  switch (result.status) {
    case 'optimized': {
      const saving =
        result.originalBytes && result.outputBytes
          ? ((1 - result.outputBytes / result.originalBytes) * 100).toFixed(1)
          : '0';
      console.log(
        `${pc.green('✔')} ${path.basename(result.filePath)} ${pc.dim(
          `(${(result.outputBytes / 1024).toFixed(1)} KB, q=${result.quality}, saved ${saving}%${
            result.renamed ? ', renamed to .webp' : ''
          })`
        )}`
      );
      break;
    }
    case 'skipped': {
      console.log(`${pc.yellow('↷')} ${path.basename(result.filePath)} ${pc.dim(`[${result.reason}]`)}`);
      break;
    }
    case 'dry-run': {
      console.log(`${pc.cyan('◷')} ${path.basename(result.filePath)} (dry run)`);
      break;
    }
    default:
      break;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cliOptions = parseArgs(process.argv.slice(2));
  optimizeMedia({
    force: cliOptions.force,
    dryRun: cliOptions.dryRun,
    paths: cliOptions.paths
  }).catch((error) => {
    console.error(pc.red(`Unexpected error: ${error.stack ?? error.message}`));
    process.exit(1);
  });
}
