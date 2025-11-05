import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  createAboutFrontmatterSchema,
  createProjectFrontmatterSchema,
  createSiteSettingsFrontmatterSchema
} from '../../src/content/schemas';

const projectSchema = createProjectFrontmatterSchema();
const siteSchema = createSiteSettingsFrontmatterSchema(z.string());
const aboutSchema = createAboutFrontmatterSchema();

const mockAsset = (path: string) => ({
  asset: path,
  alt: 'Placeholder alt text'
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
          ...mockAsset('/media/orion/hero.jpg'),
          emphasis: 'primary'
        }
      },
      gallery: [
        {
          ...mockAsset('/media/orion/screen-1.jpg'),
          layout: 'full'
        }
      ],
      motion: {}
    });

    expect(result.success).toBe(true);
  });

  it('derives slug from filename so uppercase content passes', () => {
    const result = projectSchema.safeParse({
      title: 'Slug Source',
      summary: 'Slug now derives from filename; uppercase content passes.',
      role: 'Designer',
      timeline: '2024',
      hero: {
        media: {
          ...mockAsset('/media/error/hero.jpg')
        }
      },
      gallery: [
        {
          ...mockAsset('/media/error/gallery.jpg')
        }
      ],
      motion: {}
    });

    expect(result.success).toBe(true);
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
        ...mockAsset('/media/about/portrait.jpg')
      },
      gallery: [],
      motion: {}
    });

    expect(result.success).toBe(false);
  });
});
