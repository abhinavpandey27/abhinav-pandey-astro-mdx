import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { optimizeMedia } from '../optimize-media.mjs';

const createTempDir = async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'media-optim-'));
  await fs.mkdir(path.join(dir, 'public', 'media'), { recursive: true });
  await fs.mkdir(path.join(dir, 'src', 'content'), { recursive: true });
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  return dir;
};

describe('optimize-media', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await createTempDir();
  });

  afterEach(async () => {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('converts legacy images to webp and updates references', async () => {
    const mediaDir = path.join(tmpDir, 'public', 'media');
    const contentDir = path.join(tmpDir, 'src', 'content');

    const pngPath = path.join(mediaDir, 'sample.png');
    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 3,
        background: { r: 120, g: 120, b: 120 }
      }
    })
      .png()
      .toFile(pngPath);

    const contentPath = path.join(contentDir, 'example.mdx');
    await fs.writeFile(
      contentPath,
      `---
heroCarousel:
  - asset: /media/sample.png
    alt: Example
---
`
    );

    const result = await optimizeMedia({
      appRoot: tmpDir,
      mediaRoot: mediaDir,
      paths: [pngPath]
    });

    const processed = result.processed.find((item) => item.status === 'optimized');
    expect(processed).toBeDefined();
    expect(processed.renamed).toBe(true);

    const newFile = path.join(mediaDir, 'sample.webp');
    const newStat = await fs.stat(newFile);
    expect(newStat.size).toBeLessThanOrEqual(2 * 1024 * 1024);

    await expect(fs.access(pngPath)).rejects.toBeDefined();

    const updatedContent = await fs.readFile(contentPath, 'utf8');
    expect(updatedContent).toContain('/media/sample.webp');
  });

  it('skips files that are already optimised unless forced', async () => {
    const mediaDir = path.join(tmpDir, 'public', 'media');
    const webpPath = path.join(mediaDir, 'existing.webp');
    await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 3,
        background: { r: 30, g: 144, b: 255 }
      }
    })
      .webp({ quality: 80 })
      .toFile(webpPath);

    const firstRun = await optimizeMedia({
      appRoot: tmpDir,
      mediaRoot: mediaDir,
      paths: [webpPath]
    });
    const optimised = firstRun.processed.filter((item) => item.status === 'optimized');
    expect(optimised.length).toBe(1);

    const secondRun = await optimizeMedia({
      appRoot: tmpDir,
      mediaRoot: mediaDir,
      paths: [webpPath]
    });
    const skipped = secondRun.processed.filter((item) => item.status === 'skipped');
    expect(skipped.length).toBeGreaterThan(0);
    expect(skipped[0].reason).toBe('cached');
  });
});
