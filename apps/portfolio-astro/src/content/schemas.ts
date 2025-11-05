import { z } from 'zod';

const mediaPathSchema = z.string().min(1, 'Provide a media path');

export const motionDirectivesSchema = z
  .object({
    heroVariant: z.enum(['fade', 'rise', 'slide', 'scale', 'static']).default('fade'),
    heroDuration: z.number().min(0.1).max(2).default(0.75),
    heroDelay: z.number().min(0).max(2).default(0.2),
    sectionBackground: z.enum(['light', 'dark', 'accent']).default('dark'),
    galleryVariant: z.enum(['carousel', 'parallax', 'stacked', 'none']).default('carousel'),
    galleryStagger: z.number().min(0).max(1).default(0.18),
    prefersReducedMotionCopy: z.string().optional()
  })
  .partial()
  .default({});

export const createMediaItemSchema = () =>
  z.object({
    asset: mediaPathSchema,
    alt: z.string().min(1, 'Provide meaningful alt text'),
    caption: z.string().optional(),
    emphasis: z.enum(['primary', 'secondary', 'supporting']).default('primary'),
    width: z.number().positive().optional(),
    height: z.number().positive().optional()
  });

export const createProjectFrontmatterSchema = () => {
  const mediaItem = createMediaItemSchema();

  return z.object({
    title: z.string(),
    storyLayout: z.enum(['case-study', 'metrics']).default('case-study'),
    summary: z.string().max(220, 'Keep the summary under 220 characters'),
    featured: z.boolean().default(false),
    role: z.string(),
    team: z.array(z.string()).default([]),
    timeline: z.string(),
    categories: z.array(z.string()).default([]),
    hero: z.object({
      media: mediaItem,
      kicker: z.string().optional()
    }),
    gallery: z
      .array(
        mediaItem.extend({
          layout: z.enum(['full', 'half', 'stacked']).default('full'),
          motionDelay: z.number().min(0).max(2).default(0.15)
        })
      )
      .min(1, 'Provide at least one gallery asset per project'),
    outcomes: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          description: z.string().optional()
        })
      )
      .default([]),
    highlights: z
      .array(
        z.object({
          title: z.string(),
          body: z.string()
        })
      )
      .default([]),
    cta: z
      .object({
        label: z.string(),
        href: z.string().url('Provide a valid URL'),
        isExternal: z.boolean().default(true)
      })
      .optional(),
    motion: motionDirectivesSchema
  });
};

export const createSiteSettingsFrontmatterSchema = (projectRef: z.ZodTypeAny) => {
  const mediaItem = createMediaItemSchema().omit({ emphasis: true }).extend({
    emphasis: z.enum(['primary', 'secondary', 'supporting']).default('primary')
  });

  return z.object({
    title: z.string(),
    heroTagline: z.string(),
    location: z.string(),
    intro: z.string().max(280),
    bioSnippet: z.string().optional(),
    email: z.string().email('Provide a valid email address'),
    featuredProject: projectRef,
    navLinks: z
      .array(
        z.object({
          label: z.string(),
          href: z.string()
        })
      )
      .min(1),
    socialLinks: z
      .array(
        z.object({
          label: z.enum(['twitter', 'linkedin', 'email', 'behance', 'dribbble', 'github']),
          url: z.string().url(),
          ariaLabel: z.string().optional()
        })
      )
      .default([]),
    resume: z.object({
      label: z.string().default('Download résumé'),
      file: z.string(),
      size: z.number().optional()
    }),
    heroCarousel: z.array(mediaItem).default([]),
    contactCopy: z.string().optional(),
    motion: motionDirectivesSchema
  });
};

export const createAboutFrontmatterSchema = () => {
  const mediaItem = createMediaItemSchema().omit({ emphasis: true }).extend({
    emphasis: z.enum(['primary', 'secondary']).default('primary')
  });

  return z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    location: z.string(),
    lead: z.string().max(320),
    narrativeTone: z.enum(['optimistic', 'measured', 'playful']).default('optimistic'),
    portrait: mediaItem,
    gallery: z.array(mediaItem).min(1),
    skills: z
      .array(
        z.object({
          category: z.string(),
          items: z.array(z.string()).min(1)
        })
      )
      .default([]),
    contactHighlights: z.array(z.string()).default([]),
    motion: motionDirectivesSchema
  });
};
