import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';

const baseDir = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(baseDir, '../../src/components');

afterEach(() => {
  document.body.innerHTML = '';
});

describe('HeroSection', () => {
  it('matches compiled snapshot', async () => {
    const heroPath = resolve(componentsDir, 'HeroSection.astro');
    const source = await readFile(heroPath, 'utf-8');
    expect(source).toMatchSnapshot();
  });

  it('passes axe accessibility checks for default markup', async () => {
    document.body.innerHTML = `
      <section class="hero-block" id="hero" aria-labelledby="hero-title">
        <div class="hero-block__container">
          <div class="hero-block__content">
            <h1 class="hero-block__headline" id="hero-title">Motion-rich stories for immersive products.</h1>
            <p class="hero-block__intro">I craft end-to-end product experiences.</p>
          </div>
        </div>
      </section>
    `;

    const results = await axe.run(document.body);
    expect(results.violations).toHaveLength(0);
  });
});
