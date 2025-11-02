import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  assetMetadataSchema,
  createAboutFrontmatterSchema,
  createProjectFrontmatterSchema,
  createSiteSettingsFrontmatterSchema
} from '../../src/content/schemas';

type ImageMetadata = {
  src: string;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp' | 'avif';
};

const projectSchema = createProjectFrontmatterSchema(assetMetadataSchema);
const siteSchema = createSiteSettingsFrontmatterSchema(assetMetadataSchema, z.string());
const aboutSchema = createAboutFrontmatterSchema(assetMetadataSchema);

const mockImage = (src: string): ImageMetadata => ({
  src,
  width: 1600,
  height: 900,
  format: 'jpg'
});

describe('content collections schema', () => {
  it('validates a minimal project document', () => {
    const result = projectSchema.safeParse({
      title: 'Project Orion',
      slug: 'project-orion',
      summary: 'Designing a mission control interface for deep space explorers.',
      role: 'Product Designer',
      timeline: 'Jan 2024 — Apr 2024',
      hero: {
        media: {
          asset: mockImage('/images/orion/hero.jpg'),
          alt: 'Heroic mission control dashboard',
          emphasis: 'primary'
        }
      },
      gallery: [
        {
          asset: mockImage('/images/orion/screen-1.jpg'),
          alt: 'Tablet UI',
          layout: 'full'
        }
      ],
      motion: {}
    });

    expect(result.success).toBe(true);
  });

  it('fails if project slug has uppercase letters', () => {
    const result = projectSchema.safeParse({
      title: 'Slug Error',
      slug: 'Project-Orion',
      summary: 'Invalid slug should fail.',
      role: 'Designer',
      timeline: '2024',
      hero: {
        media: {
          asset: mockImage('/images/error/hero.jpg'),
          alt: 'Invalid slug hero'
        }
      },
      gallery: [
        {
          asset: mockImage('/images/error/gallery.jpg'),
          alt: 'Gallery'
        }
      ],
      motion: {}
    });

    expect(result.success).toBe(false);
  });

  it('validates site settings and enforces mandatory fields', () => {
    const result = siteSchema.safeParse({
      title: 'Abhinav Pandey',
      heroTagline: 'Designing immersive digital stories.',
      location: 'Mumbai, India',
      intro: 'I craft thoughtful product experiences with motion-driven storytelling.',
      email: 'hello@example.com',
      featuredProject: 'project-orion',
      navLinks: [
        { label: 'Work', href: '#work' },
        { label: 'About', href: '#about' }
      ],
      resume: {
        file: '/media/resume.pdf'
      }
    });

    expect(result.success).toBe(true);
  });

  it('requires at least one gallery asset in about collection', () => {
    const result = aboutSchema.safeParse({
      title: 'About Abhinav',
      location: 'Mumbai, India',
      lead: 'Designing immersive, human-centered stories.',
      portrait: {
        asset: mockImage('/images/about/portrait.jpg'),
        alt: 'Portrait of Abhinav'
      },
      gallery: [],
      motion: {}
    });

    expect(result.success).toBe(false);
  });
});
