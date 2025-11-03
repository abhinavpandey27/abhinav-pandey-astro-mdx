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

describe('NavHeader', () => {
  it('matches compiled snapshot and preserves navigation semantics', async () => {
    const navHeaderPath = resolve(componentsDir, 'NavHeader.astro');
    const source = await readFile(navHeaderPath, 'utf-8');
    expect(source).toMatchSnapshot();
    expect(source).toContain('aria-label="Primary"');
    expect(source).toContain('aria-label="Social"');
    expect(source).toContain('class="nav-header__menu"');
  });
});

describe('HeroSection', () => {
  it('matches compiled snapshot', async () => {
    const heroPath = resolve(componentsDir, 'HeroSection.astro');
    const source = await readFile(heroPath, 'utf-8');
    expect(source).toMatchSnapshot();
    expect(source).toContain('aria-label="Featured project imagery"');
  });

  it('passes axe accessibility checks for default markup', async () => {
    document.body.innerHTML = `
      <section class="hero" id="hero" aria-labelledby="hero-title">
        <div class="hero__inner">
          <div class="hero__copy">
            <p class="hero__eyebrow">Featured designer</p>
            <h1 class="hero__title" id="hero-title">Motion-rich stories for immersive products.</h1>
            <p class="hero__intro">I craft end-to-end product experiences.</p>
          </div>
          <article class="hero__highlight">
            <h2 class="hero__highlight-title">Narrative-led mission planning</h2>
            <p class="hero__highlight-summary">A cinematic planning surface.</p>
            <dl class="hero__metadata">
              <div class="hero__metadata-item">
                <dt>Role</dt>
                <dd>Lead Product Designer</dd>
              </div>
            </dl>
            <a class="hero__cta" href="https://example.com/case" rel="noopener noreferrer">Read case study</a>
          </article>
        </div>
      </section>
    `;

    const results = await axe.run(document.body);
    expect(results.violations).toHaveLength(0);
  });
});
