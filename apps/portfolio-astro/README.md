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
2. **Images live inside `src/content/media/`** while you iterate. Replace `../media/placeholder.png` with exported JPG/PNG files. Keep filenames kebab-cased.
3. **Alt text is required everywhere.** Write narrative alt text that makes sense without visuals.
4. **Slugs** must stay lowercase + kebab-case. Tina will block invalid values but double-check before committing.
5. **Project galleries** need at least one asset; aim for two or more to showcase motion states.

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