# Portfolio Authoring Handbook

This handbook gives designers everything needed to publish motion-aware stories in the Astro + Tina workspace. Keep it open while editing content—each section maps to a task in **1.0 Content Authoring Foundations**.

## Prerequisites
- Install Node.js **18.17.0 or newer** (Astro requires ≥18.14.1; Tina works best on ≥18.17).
- `npm install` from `apps/portfolio-astro/`.
- To launch Tina locally you'll need `TINA_CLIENT_ID` and `TINA_TOKEN` in `.env`. Ask the dev team if you don't have them yet.

## Content Collections At A Glance

| Collection | Path | Purpose | Notes |
| --- | --- | --- | --- |
| `projects` | `src/content/projects/*.mdx` | Case studies, motion directives, gallery media | Each file = one project. Use kebab-case filenames/slugs. |
| `site` | `src/content/settings/site.mdx` | Global navigation, hero copy, contact surfaces | Contains the featured project reference used on the homepage. |
| `about` | `src/content/about/index.mdx` | Bio narrative, skill groupings, gallery assets | Drives the About section and Tina global form. |

All collections extend the shared motion-aware schemas defined in `src/content/schemas.ts`. Validation happens in both Astro and Tina.

## Frontmatter Conventions

1. **Motion directives come last** in each document (`motion` object) so they're easy to diff.
2. **Images live inside `src/content/media/`** while you iterate. Replace the placeholder asset (`../media/placeholder.jpeg`) with exported JPG/PNG files. Keep filenames kebab-cased.
3. **Alt text is required everywhere.** Write narrative alt text that makes sense without visuals.
4. **Slugs** must stay lowercase + kebab-case. Tina will block invalid values but double-check before committing.
5. **Project galleries** need at least one asset; aim for two or more to showcase motion states.
6. **Theme objects** (optional) define per-section palettes for scroll-driven theming. Each section can specify `bg`, `text`, `accent`, and `typography` overrides.

### MDX Helpers
- Standard Markdown headings and lists work out of the box.
- When you need bespoke callouts or metrics blocks, create MDX components under `src/components/mdx/` and import them at the top of the document (see example in `project-atlas.mdx` comments). Keep components accessible and tokens-driven.

## Starter Content Included

The repo now ships with sample entries that mirror the PRD narrative:

- `src/content/projects/project-atlas.mdx` – illustrates motion directives, outcomes, and CTA wiring.
- `src/content/settings/site.mdx` – seeds navigation, carousel media, and résumé metadata.
- `src/content/about/index.mdx` – demonstrates gallery usage, skills grouping, and accessibility blurbs.
- `public/media/resume-sample.pdf` – lightweight placeholder résumé (<1 KB, swap with a real PDF before launch).

Use these as working copies. When cloning for a new story, duplicate the file and update `title`, `slug`, and media references first.

## TinaCMS Workflow

1. Run `npm run tina:dev` to launch the Tina sidebar (requires auth env vars).
2. Use the **Projects** collection to add or duplicate case studies.
3. Update global copy in the **Site Settings** and **About** collections—both are marked as global forms so changes persist across pages.
4. Tina enforces critical validations (slug format, alt text, required gallery asset). Fix issues inline before publishing.
5. Publish commits via Tina or push from your local git workflow. Remember to replace placeholder media in the repo before merging.

## Quality Checks

Run the content lint script before requesting review:

```bash
npm run lint:content
```

This command runs Astro's content validation and ensures MDX frontmatter matches the shared schemas. It fails fast on missing media, invalid slugs, or schema mismatches.

### Additional Spot Checks
- `npm run astro check` – type + content safety net (requires Node ≥18.14.1).
- `npm run dev` – smoke-test the homepage with live content (replace placeholder media for accurate previews).
- `npm run tina:build` – regenerates Tina admin for production (may need extra disk space locally).

## Commit Checklist

Before you mark task **1.3 Authoring handbook and starter content** complete:
- [ ] Replace placeholder imagery with final exports.
- [ ] Confirm résumé asset is under 5 MB and committed to `public/media`.
- [ ] Run `npm run lint:content` (and `npm run astro check` when Node version allows).
- [ ] Document any manual testing (designer review notes) in the PR description.

Happy storytelling—motion-first and accessible by default!

## Scroll-Driven Theming

The homepage implements scroll-driven theming: as visitors scroll through sections, the active section's theme (background, text, accent colors, and typography) becomes the site-wide theme until the next section takes over.

### How It Works

1. **Theme Registry**: Each section (hero, projects, about, contact) can define a `theme` object in its frontmatter with:
   - `bg`: Background color (hex or CSS color value)
   - `text`: Text color (hex or CSS color value)
   - `accent`: Accent color for CTAs and highlights
   - `typography`: Optional object with `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`

2. **IntersectionObserver**: The page tracks which section dominates the viewport and updates root CSS variables (`--theme-bg`, `--theme-text`, etc.) accordingly.

3. **Smooth Transitions**: Theme changes animate smoothly (0.6s by default, 0.15s for reduced-motion users) to avoid jarring shifts.

4. **Fallbacks**: If a section doesn't define a theme, defaults are derived from the `sectionBackground` motion directive (light/dark/accent).

### Setting Themes in Tina

1. Navigate to **Projects** → select a project → scroll to **Theme** section
2. Use the color pickers for `bg`, `text`, and `accent` (or enter hex values)
3. Optionally customize typography overrides
4. Save and preview - theme changes apply when that section is dominant in viewport

### Accessibility & Performance

- **Reduced Motion**: Theme transitions respect `prefers-reduced-motion` (0.15s instead of 0.6s)
- **Focus Indicators**: All focus states use `--theme-accent` to ensure visibility across backgrounds
- **Contrast**: Ensure theme colors meet WCAG AA contrast ratios (4.5:1 for normal text)
- **Mobile Optimized**: Lower intersection thresholds on mobile prevent flicker during rapid scrolling
- **Viewport Height**: All sections enforce `min-height: 100vh` to give themes time to breathe

### QA Checklist for Scroll-Driven Theming

Before marking scroll-driven theming complete:

- [ ] Scroll through homepage and verify each section's theme applies when it dominates the viewport
- [ ] Check theme transitions are smooth (not instant) on desktop
- [ ] Enable reduced-motion in OS settings and verify transitions are ≤150ms
- [ ] Test on mobile: scroll rapidly and confirm no flicker or theme jitter
- [ ] Verify focus indicators are visible on all backgrounds (test keyboard navigation)
- [ ] Check contrast ratios: text should be readable on background colors (WCAG AA: 4.5:1)
- [ ] Add a new project with custom theme in Tina and verify it appears correctly
- [ ] Test with sections that don't define themes - ensure fallbacks work based on `sectionBackground`
- [ ] Verify navigation header adapts to theme changes (background and text colors)
- [ ] Check that all interactive elements (buttons, links) use theme-accent for focus states

### MDX Shortcodes

The project MDX supports `<Callout>` and `<OutcomeMetric>` components without manual imports. Use Tina’s MDX editor to insert them with the provided templates. Example:

```mdx
<Callout title="Motion principle" tone="highlight">
Remember to respect reduced-motion preferences when sequencing transitions.
</Callout>

<OutcomeMetric label="Completion Rate" value="92%" description="Reviewers reached the final section." emphasis="accent" align="center" />
```

## Deployment (Vercel)

- Import `abhinavpandey27/abhinav-pandey-astro-mdx` into Vercel and set the **Root Directory** to `apps/portfolio-astro` so only the Astro app builds.
- Use Node.js **18.17 or newer** (Project Settings → General → Node.js Version) to satisfy Astro/Tina requirements.
- Build command: `npm run build` (runs `tinacms build --skip-cloud-checks` before `astro build` so the `/admin` bundle ships with each deploy without re-validating against Tina Cloud during CI)  
  Install command: default (`npm install`)  
  Output directory: `dist`
- Enable automatic deployments: production promotes from `main`; pull requests receive preview URLs for review.
- After the first deploy, verify the production URL and preview comments. If the build fails, inspect Vercel logs, adjust Node version or build settings, and redeploy.
- Detailed setup and validation steps live in `docs/tasks/002-vercel-deployment/specs/002-spec-vercel-deployment.md`.
