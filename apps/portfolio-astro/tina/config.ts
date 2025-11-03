import { defineConfig } from 'tinacms';

const ensureContentMediaPath = (value?: string | null) => {
  if (!value) return value ?? '';
  const trimmed = value.trim();
  if (trimmed.startsWith('../')) return trimmed;
  if (trimmed.startsWith('/')) return `..${trimmed}`;
  return `../${trimmed}`;
};

const ensureMediaUiValue = (value?: string | null) => {
  if (!value) return value ?? '';
  return value.replace(/^..\//, '/');
};

const mediaUiTransforms = {
  parse: (value?: string | null) => ensureContentMediaPath(value),
  format: (value?: string | null) => ensureMediaUiValue(value)
};

const branch =
  process.env.TINA_BRANCH ||
  process.env.GITHUB_HEAD_REF ||
  process.env.GITHUB_REF_NAME ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.VERCEL_BRANCH ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId:
    process.env.TINA_CLIENT_ID ||
    process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
    '',
  token: process.env.TINA_TOKEN || '',
  client: {
    referenceDepth: 2
  },
  build: {
    outputFolder: 'admin',
    publicFolder: 'public'
  },
  media: {
    tina: {
      mediaRoot: 'media',
      publicFolder: 'public'
    }
  },
  schema: {
    collections: [
      {
        name: 'project',
        label: 'Projects',
        path: 'src/content/projects',
        format: 'mdx',
        fields: [
          { name: 'title', label: 'Title', type: 'string', isTitle: true, required: true },
          {
            name: 'slug',
            label: 'Slug',
            type: 'string',
            required: true,
            ui: {
              validate: (value) =>
                value && /^[a-z0-9-]+$/.test(value)
                  ? undefined
                  : 'Use lowercase kebab-case (letters, numbers, hyphen only)'
            }
          },
          {
            name: 'summary',
            label: 'Summary',
            type: 'string',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value) =>
                value && value.length <= 220 ? undefined : 'Keep summary under 220 characters'
            }
          },
          {
            name: 'storyLayout',
            label: 'Layout Variant',
            type: 'string',
            options: [
              { label: 'Case Study', value: 'case-study' },
              { label: 'Metrics Spotlight', value: 'metrics' }
            ],
            required: false,
            ui: {
              component: 'select',
              description: 'Controls the layout variant rendered on the work section.'
            }
          },
          { name: 'featured', label: 'Featured', type: 'boolean', required: false },
          { name: 'role', label: 'Role', type: 'string', required: true },
          {
            name: 'team',
            label: 'Team Members',
            type: 'string',
            list: true
          },
          { name: 'timeline', label: 'Timeline', type: 'string', required: true },
          {
            name: 'categories',
            label: 'Categories',
            type: 'string',
            list: true
          },
          {
            name: 'hero',
            label: 'Hero',
            type: 'object',
            required: true,
            fields: [
              {
                name: 'media',
                label: 'Hero Media',
                type: 'object',
                required: true,
                fields: [
                  {
                    name: 'asset',
                    label: 'Asset',
                    type: 'image',
                    required: true,
                    ui: mediaUiTransforms
                  },
                  {
                    name: 'alt',
                    label: 'Alt Text',
                    type: 'string',
                    required: true,
                    ui: {
                      validate: (value) =>
                        value && value.trim().length > 0 ? undefined : 'Provide meaningful alt text'
                    }
                  },
                  { name: 'caption', label: 'Caption', type: 'string' },
                  {
                    name: 'emphasis',
                    label: 'Emphasis',
                    type: 'string',
                    options: ['primary', 'secondary', 'supporting'],
                    required: false
                  }
                ]
              },
              { name: 'kicker', label: 'Kicker', type: 'string' }
            ]
          },
          {
            name: 'gallery',
            label: 'Gallery',
            type: 'object',
            list: true,
            ui: {
              validate: (value) =>
                Array.isArray(value) && value.length >= 1
                  ? undefined
                  : 'Provide at least one gallery asset'
            },
            fields: [
              {
                name: 'asset',
                label: 'Asset',
                type: 'image',
                required: true,
                ui: mediaUiTransforms
              },
              {
                name: 'alt',
                label: 'Alt Text',
                type: 'string',
                required: true,
                ui: {
                  validate: (value) =>
                    value && value.trim().length > 0 ? undefined : 'Provide meaningful alt text'
                }
              },
              { name: 'caption', label: 'Caption', type: 'string' },
              {
                name: 'emphasis',
                label: 'Emphasis',
                type: 'string',
                options: ['primary', 'secondary', 'supporting'],
                required: false
              },
              {
                name: 'layout',
                label: 'Layout',
                type: 'string',
                required: true,
                options: ['full', 'half', 'stacked']
              },
              {
                name: 'motionDelay',
                label: 'Motion Delay (s)',
                type: 'number',
                required: false,
                ui: {
                  validate: (value) =>
                    value === undefined || (value >= 0 && value <= 2)
                      ? undefined
                      : 'Motion delay must be between 0 and 2 seconds'
                }
              }
            ]
          },
          {
            name: 'outcomes',
            label: 'Outcome Metrics',
            type: 'object',
            list: true,
            fields: [
              { name: 'label', label: 'Label', type: 'string', required: true },
              { name: 'value', label: 'Value', type: 'string', required: true },
              { name: 'description', label: 'Description', type: 'string' }
            ]
          },
          {
            name: 'highlights',
            label: 'Highlights',
            type: 'object',
            list: true,
            fields: [
              { name: 'title', label: 'Title', type: 'string', required: true },
              {
                name: 'body',
                label: 'Body',
                type: 'rich-text',
                isBody: true,
                templates: [
                  {
                    name: 'Callout',
                    label: 'Callout',
                    fields: [
                      { name: 'title', label: 'Title', type: 'string' },
                      {
                        name: 'tone',
                        label: 'Tone',
                        type: 'string',
                        options: [
                          { label: 'Neutral', value: 'neutral' },
                          { label: 'Highlight', value: 'highlight' },
                          { label: 'Warning', value: 'warning' }
                        ]
                      },
                      { name: 'icon', label: 'Icon Emoji', type: 'string' }
                    ]
                  },
                  {
                    name: 'OutcomeMetric',
                    label: 'Outcome Metric',
                    fields: [
                      { name: 'label', label: 'Label', type: 'string', required: true },
                      { name: 'value', label: 'Value', type: 'string', required: true },
                      { name: 'description', label: 'Description', type: 'string' },
                      {
                        name: 'emphasis',
                        label: 'Emphasis',
                        type: 'string',
                        options: [
                          { label: 'Primary', value: 'primary' },
                          { label: 'Accent', value: 'accent' }
                        ]
                      },
                      {
                        name: 'align',
                        label: 'Alignment',
                        type: 'string',
                        options: [
                          { label: 'Left', value: 'left' },
                          { label: 'Center', value: 'center' },
                          { label: 'Right', value: 'right' }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'cta',
            label: 'Call To Action',
            type: 'object',
            fields: [
              { name: 'label', label: 'Label', type: 'string', required: true },
              { name: 'href', label: 'URL', type: 'string', required: true },
              { name: 'isExternal', label: 'External Link', type: 'boolean' }
            ]
          },
          {
            name: 'motion',
            label: 'Motion Directives',
            type: 'object',
            fields: [
              {
                name: 'heroVariant',
                label: 'Hero Variant',
                type: 'string',
                options: ['fade', 'rise', 'slide', 'scale', 'static']
              },
              {
                name: 'heroDuration',
                label: 'Hero Duration (s)',
                type: 'number'
              },
              { name: 'heroDelay', label: 'Hero Delay (s)', type: 'number' },
              {
                name: 'sectionBackground',
                label: 'Section Background',
                type: 'string',
                options: ['light', 'dark', 'accent']
              },
              {
                name: 'galleryVariant',
                label: 'Gallery Variant',
                type: 'string',
                options: ['carousel', 'parallax', 'stacked', 'none']
              },
              {
                name: 'galleryStagger',
                label: 'Gallery Stagger (s)',
                type: 'number'
              },
              {
                name: 'prefersReducedMotionCopy',
                label: 'Reduced Motion Copy',
                type: 'string',
                ui: { component: 'textarea' }
              }
            ]
          }
        ]
      },
      {
        name: 'site',
        label: 'Site Settings',
        path: 'src/content/site',
        format: 'mdx',
        ui: {
          global: true
        },
        fields: [
          { name: 'title', label: 'Site Title', type: 'string', required: true },
          { name: 'heroTagline', label: 'Hero Tagline', type: 'string', required: true },
          { name: 'location', label: 'Location', type: 'string', required: true },
          {
            name: 'intro',
            label: 'Intro Copy',
            type: 'string',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value) =>
                value && value.length <= 280 ? undefined : 'Keep intro under 280 characters'
            }
          },
          {
            name: 'bioSnippet',
            label: 'Bio Snippet',
            type: 'string',
            ui: { component: 'textarea' }
          },
          {
            name: 'email',
            label: 'Contact Email',
            type: 'string',
            required: true,
            ui: {
              validate: (value) =>
                value && /.+@.+\..+/.test(value) ? undefined : 'Provide a valid email address'
            }
          },
          {
            name: 'featuredProject',
            label: 'Featured Project',
            type: 'reference',
            collections: ['project'],
            required: true
          },
          {
            name: 'navLinks',
            label: 'Navigation Links',
            type: 'object',
            list: true,
            required: true,
            fields: [
              { name: 'label', label: 'Label', type: 'string', required: true },
              { name: 'href', label: 'Href', type: 'string', required: true }
            ]
          },
          {
            name: 'socialLinks',
            label: 'Social Links',
            type: 'object',
            list: true,
            fields: [
              {
                name: 'label',
                label: 'Platform',
                type: 'string',
                options: ['twitter', 'linkedin', 'email', 'behance', 'dribbble', 'github'],
                required: true
              },
              { name: 'url', label: 'URL', type: 'string', required: true },
              { name: 'ariaLabel', label: 'ARIA Label', type: 'string' }
            ]
          },
          {
            name: 'resume',
            label: 'Resume',
            type: 'object',
            required: true,
            fields: [
              { name: 'label', label: 'Label', type: 'string', required: true },
              { name: 'file', label: 'File Path', type: 'string', required: true },
              { name: 'size', label: 'File Size (MB)', type: 'number' }
            ]
          },
          {
            name: 'heroCarousel',
            label: 'Hero Carousel',
            type: 'object',
            list: true,
            fields: [
              {
                name: 'asset',
                label: 'Asset',
                type: 'image',
                required: true,
                ui: mediaUiTransforms
              },
              {
                name: 'alt',
                label: 'Alt Text',
                type: 'string',
                required: true,
                ui: {
                  validate: (value) =>
                    value && value.trim().length > 0 ? undefined : 'Provide meaningful alt text'
                }
              },
              { name: 'caption', label: 'Caption', type: 'string' },
              {
                name: 'emphasis',
                label: 'Emphasis',
                type: 'string',
                options: ['primary', 'secondary', 'supporting'],
                required: false
              }
            ]
          },
          {
            name: 'contactCopy',
            label: 'Contact Copy',
            type: 'string',
            ui: { component: 'textarea' }
          },
          {
            name: 'motion',
            label: 'Motion Directives',
            type: 'object',
            fields: [
              {
                name: 'heroVariant',
                label: 'Hero Variant',
                type: 'string',
                options: ['fade', 'rise', 'slide', 'scale', 'static']
              },
              { name: 'heroDuration', label: 'Hero Duration (s)', type: 'number' },
              { name: 'heroDelay', label: 'Hero Delay (s)', type: 'number' },
              {
                name: 'sectionBackground',
                label: 'Section Background',
                type: 'string',
                options: ['light', 'dark', 'accent']
              },
              {
                name: 'galleryVariant',
                label: 'Gallery Variant',
                type: 'string',
                options: ['carousel', 'parallax', 'stacked', 'none']
              },
              { name: 'galleryStagger', label: 'Gallery Stagger (s)', type: 'number' },
              {
                name: 'prefersReducedMotionCopy',
                label: 'Reduced Motion Copy',
                type: 'string',
                ui: { component: 'textarea' }
              }
            ]
          }
        ]
      },
      {
        name: 'about',
        label: 'About',
        path: 'src/content/about',
        format: 'mdx',
        ui: {
          global: true
        },
        fields: [
          { name: 'title', label: 'Title', type: 'string', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'string' },
          { name: 'location', label: 'Location', type: 'string', required: true },
          {
            name: 'lead',
            label: 'Lead Copy',
            type: 'string',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value) =>
                value && value.length <= 320 ? undefined : 'Keep lead under 320 characters'
            }
          },
          {
            name: 'narrativeTone',
            label: 'Narrative Tone',
            type: 'string',
            options: ['optimistic', 'measured', 'playful'],
            required: true
          },
          {
            name: 'portrait',
            label: 'Portrait',
            type: 'object',
            required: true,
            fields: [
              {
                name: 'asset',
                label: 'Asset',
                type: 'image',
                required: true,
                ui: mediaUiTransforms
              },
              {
                name: 'alt',
                label: 'Alt Text',
                type: 'string',
                required: true,
                ui: {
                  validate: (value) =>
                    value && value.trim().length > 0 ? undefined : 'Provide meaningful alt text'
                }
              },
              { name: 'caption', label: 'Caption', type: 'string' },
              {
                name: 'emphasis',
                label: 'Emphasis',
                type: 'string',
                options: ['primary', 'secondary'],
                required: false
              }
            ]
          },
          {
            name: 'gallery',
            label: 'Gallery',
            type: 'object',
            list: true,
            ui: {
              validate: (value) =>
                Array.isArray(value) && value.length > 0
                  ? undefined
                  : 'Include at least one gallery asset'
            },
            fields: [
              {
                name: 'asset',
                label: 'Asset',
                type: 'image',
                required: true,
                ui: mediaUiTransforms
              },
              {
                name: 'alt',
                label: 'Alt Text',
                type: 'string',
                required: true,
                ui: {
                  validate: (value) =>
                    value && value.trim().length > 0 ? undefined : 'Provide meaningful alt text'
                }
              },
              { name: 'caption', label: 'Caption', type: 'string' },
              {
                name: 'emphasis',
                label: 'Emphasis',
                type: 'string',
                options: ['primary', 'secondary'],
                required: false
              }
            ]
          },
          {
            name: 'skills',
            label: 'Skill Groupings',
            type: 'object',
            list: true,
            fields: [
              { name: 'category', label: 'Category', type: 'string', required: true },
              {
                name: 'items',
                label: 'Items',
                type: 'string',
                list: true,
                required: true,
                ui: {
                  validate: (value) =>
                    Array.isArray(value) && value.length > 0
                      ? undefined
                      : 'Provide at least one skill per category'
                }
              }
            ]
          },
          {
            name: 'contactHighlights',
            label: 'Contact Highlights',
            type: 'string',
            list: true
          },
          {
            name: 'motion',
            label: 'Motion Directives',
            type: 'object',
            fields: [
              {
                name: 'heroVariant',
                label: 'Intro Variant',
                type: 'string',
                options: ['fade', 'rise', 'slide', 'scale', 'static']
              },
              { name: 'heroDuration', label: 'Intro Duration (s)', type: 'number' },
              { name: 'heroDelay', label: 'Intro Delay (s)', type: 'number' },
              {
                name: 'sectionBackground',
                label: 'Background',
                type: 'string',
                options: ['light', 'dark', 'accent']
              },
              {
                name: 'galleryVariant',
                label: 'Gallery Variant',
                type: 'string',
                options: ['carousel', 'parallax', 'stacked', 'none']
              },
              { name: 'galleryStagger', label: 'Gallery Stagger (s)', type: 'number' },
              {
                name: 'prefersReducedMotionCopy',
                label: 'Reduced Motion Copy',
                type: 'string',
                ui: { component: 'textarea' }
              }
            ]
          }
        ]
      }
    ]
  }
});
