# CLAUDE.md

## Project
Astro blog template port. Tailwind + BasecoatUI for components.
Minimal, Muul-philosophy: simple, composable, no bloat.

## Commands

```bash
npm run dev        # Start dev server (drafts visible in dev mode)
npm run build      # Production build
npm run preview    # Preview production build
```

No test runner is configured. There is no lint script — TypeScript checking is via `astro check` (not in package.json scripts but available via `npx astro check`).

## Architecture

This is an Astro 6 personal blog ("Astro Base") with MDX, TailwindCSS v4, and Pagefind search.

### Content Collections

Two collections defined in `src/content.config.ts`:
- **posts** — `src/content/posts/**/*.{md,mdx}`, uses `postSchema`
- **pages** — `src/content/pages/**/*.{md,mdx}`, uses `pageSchema`

Schemas are in `src/schemas/`. Base schema (`baseSchema`) has `title`, `description`, `draft`. Post schema extends it with `published` (required date), `cover`, `tags[]`, `series`, `order`. Draft posts are hidden in production but visible in dev.

### Layout Hierarchy

`BaseLayout.astro` → root HTML scaffold with named slots: `seo`, `head`, `header`, `content`, `navigation`, `after`, `scripts`.

- `BlogLayout.astro` — wraps `BaseLayout` for blog posts; handles related posts, series navigation, reading time
- `PageLayout.astro` — wraps `BaseLayout` for static pages

The default (unnamed) slot in `BaseLayout` is for pages that manage their own layout (index, search, 404).

### Routing

- `/` → `src/pages/index.astro` — homepage with recent posts
- `/posts` → `src/pages/posts/[...page].astro` — paginated post list
- `/posts/[...slug]` → `src/pages/posts/[...slug].astro` — individual post (uses `BlogLayout`)
- `/tags` → `src/pages/tags/index.astro`
- `/tags/[tag]` → `src/pages/tags/[tag].astro`
- `/[page]` → `src/pages/[page].astro` — dynamic pages from the `pages` collection
- `/search` → `src/pages/search.astro` — Pagefind-powered search
- `/rss.xml` → `src/pages/rss.xml.ts`

### Path Alias

`@/` maps to `src/` (configured in `tsconfig.json`).

### Styling

CSS entry point: `src/styles/global.css` imports TailwindCSS v4, `basecoat-css`, then project files:
- `tokens.css` — layout tokens (`--width-container`, `--width-prose`)
- `theme.css` — color tokens for light/dark mode + Tailwind theme bridge
- `base.css` — structural defaults: body font, focus ring, disabled state
- `typography.css` — all prose element defaults (`@layer base`) + `.post-content` overrides (`@layer components`)
- `components.css` — shared component styles

Dark mode uses `.dark` class on the body (toggled via `ThemeInit.astro` to prevent FOUC). Expressive Code (syntax highlighting) uses `everforest-dark`/`everforest-light` themes tied to `[data-theme]` attribute.

Fonts (via Astro font API / Fontsource): `--font-headings` (Rubik), `--font-primary` (Poppins), `--font-secondary` (Newsreader), `--font-code` (Fira Code).

### Content Utilities

`src/utils/content.utils.ts` centralizes all collection queries:
- `getPublishedPosts()` — all posts sorted by date desc, draft-filtered
- `getPublishedPages()` — pages collection, draft-filtered
- `getPost(id)` — single post by id
- `getPostsByTag(tag)`, `getAllTags()`, `getSeriesPosts(series)`, `getRelatedPosts()`
- `getPostsByYear()` — `Map<year, posts[]>` grouped by publish year
- `groupByYear(posts)` — pure grouping helper
- `calculateReadingTime(content)` — pure function, default 200 wpm

`src/utils/string.utils.ts` exports `ordinalSuffix(day)` — used by PostMeta for date formatting.

### Site Config

`src/site.config.ts` exports `siteConfig` with site URL, title, description, author, social links, navigation items, pagination constants (`recentPosts`, `relatedPosts`, `postsPerPage`), and container width settings (`pageWidth`, `contentWidth`).

### Post Frontmatter

```yaml
---
title: "Post Title"          # required
published: 2024-01-15        # required
description: "..."           # optional
draft: false                 # optional, default false
tags: [tag1, tag2]           # optional
cover: /path/to/image.jpg    # optional
series: "Series Name"        # optional
order: 1                     # optional, for series ordering
---
```
## Styling Convention
Use semantic CSS classes over inline Tailwind utilities.
Define semantic classes in components/base/theme css files under `src/styles/*.css` using `@apply`.

### When to use semantic classes
- Layout patterns (post-content, post-meta, page-header)
- Typography groups
- Recurring component patterns (tag, tag-list, pagination)

### When to use inline Tailwind
- One-off spacing/sizing
- Responsive tweaks
- Structural utilities unlikely to need overriding

## Layout Structure
BaseLayout → shell only, no content opinions
BlogLayout → owns article tag + pagefind attributes
PageLayout → plain wrapper, default slot

## Slots in BaseLayout
- seo, head → injected into <head>
- header, meta, navigation, after → named content regions
- default <slot /> → main content
- scripts → page-specific scripts

## Component System
Each component is self-contained with its own semantic class.

- `Head.astro` — `<head>` scaffold: fonts, meta, RSS/sitemap links, ThemeInit
- `Header.astro` — sticky nav, theme toggle, mobile hamburger; owns theme/mobile toggle scripts
- `Footer.astro` — copyright + social links from siteConfig
- `Container.astro` — responsive width wrapper; props: `setWidth` (sm/md/lg/xl/2xl), `class`
- `PageHeader.astro` — `<h1>` title + optional meta slot; `pagefind` prop for data-pagefind-meta
- `SEO.astro` — meta/og/twitter tags; props: title, description, type, publishedTime, tags, image, noindex
- `ThemeInit.astro` — inline FOUC-prevention script; reads localStorage → prefers-color-scheme → sets `.dark`
- `PostMeta.astro` — post date, reading time, tags
- `PostItem.astro` — single post card/list entry
- `PostList.astro` — renders a list of PostItems
- `Tag.astro` — single tag pill/link
- `TagList.astro` — renders a list of Tags
- `Pagination.astro` — prev/next page controls
- `SeriesNav.astro` — `<details>` series listing with prev/next navigation
- `Search.astro` — Pagefind UI loader + URL query persistence
- `NavBar.astro` — placeholder (currently empty)

## Do Not
- Add logic to BaseLayout
- Use inline Tailwind for typography
- Add typography rules to base.css — typography.css owns all prose element defaults