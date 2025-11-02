import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@headlessui/react', () => ({
  Dialog: ({ children }: { children: unknown }) => children,
  Transition: ({ children }: { children: unknown }) => children,
  TransitionChild: ({ children }: { children: unknown }) => children
}));

if (typeof (globalThis as any).Element === 'undefined') {
  (globalThis as any).Element = class {};
}

let tinaConfig: any;

beforeAll(async () => {
  const mod = await import('../../tina/config');
  tinaConfig = mod.default;
});

describe('tina config collections', () => {
  it('defines projects, site, and about collections', () => {
    const collectionNames = tinaConfig.schema?.collections?.map(
      (collection: { name: string }) => collection.name
    );

    expect(collectionNames).toEqual(['project', 'site', 'about']);
  });

  it('aligns project collection path and required fields', () => {
    const projectCollection = tinaConfig.schema?.collections?.find(
      (collection: { name: string }) => collection.name === 'project'
    );

    expect(projectCollection?.path).toBe('src/content/projects');
    const fieldNames = projectCollection?.fields?.map((field: any) => field.name);
    expect(fieldNames).toContain('title');
    expect(fieldNames).toContain('slug');
    expect(fieldNames).toContain('summary');
    expect(fieldNames).toContain('hero');
    expect(fieldNames).toContain('motion');
  });

  it('enforces slug validation rule for projects', () => {
    const slugField: any = tinaConfig.schema?.collections
      ?.find((collection: { name: string }) => collection.name === 'project')
      ?.fields?.find((field: any) => field.name === 'slug');

    expect(slugField?.ui?.validate?.('valid-slug')).toBeUndefined();
    expect(slugField?.ui?.validate?.('Invalid Slug')).toBe(
      'Use lowercase kebab-case (letters, numbers, hyphen only)'
    );
  });

  it('requires at least one gallery asset', () => {
    const galleryField: any = tinaConfig.schema?.collections
      ?.find((collection: { name: string }) => collection.name === 'project')
      ?.fields?.find((field: any) => field.name === 'gallery');

    expect(galleryField?.ui?.validate?.([{ alt: 'Mock asset' }])).toBeUndefined();
    expect(galleryField?.ui?.validate?.([])).toBe('Provide at least one gallery asset');
  });
});
