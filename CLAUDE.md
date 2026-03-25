# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
Astro blog template port. Tailwind + Muul semantic token system for styling.
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

### Post Folder Structure

Posts support a folder-based structure:

```
src/content/posts/
  my-post/
    index.md          # post content
    attachments/      # inline images referenced in markdown
    gallery/          # dedicated gallery images (*.jpg, *.png, etc.)
```

Bare image filenames in markdown (e.g. `![](photo.jpg)`) resolve to `./attachments/photo.jpg` automatically via the remark image processing plugin.

### Layout Hierarchy

`BaseLayout.astro` → root HTML scaffold with named slots: `seo`, `head`, `header`, `meta`, `navigation`, `after`, `scripts`, plus default slot.

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

CSS entry point: `src/styles/global.css` imports TailwindCSS v4, then project files:
- `tokens.css` — Anthropic Slate primitive scale, named accent palette, system colors (`--color-focus`, `--color-error`), layout scale (`--width-container`, `--width-prose`)
- `theme.css` — Muul semantic tokens using native `light-dark()` (background, foreground, border, accent tiers) + `@theme inline` Tailwind bridge
- `base.css` — structural defaults: body font, focus ring, disabled state
- `typography.css` — all prose element defaults (`@layer base`) + `.post-content` overrides (`@layer components`)
- `components.css` — shared component styles

Dark mode uses `color-scheme` property on `:root` (set via `ThemeInit.astro` to prevent FOUC). Expressive Code (syntax highlighting) uses `everforest-dark`/`everforest-light` themes tied to `[data-theme]` attribute.

Fonts (via Astro font API / Fontsource): `--font-headings` (Rubik), `--font-primary` (Poppins), `--font-secondary` (Newsreader), `--font-code` (Fira Code).

### Remark Plugin Pipeline

Three custom remark plugins are registered in `astro.config.mjs` (applied in order):

1. **`remarkObsidianCore`** (`src/utils/remark-obsidian-core.ts`) — single-pass Obsidian syntax handler:
   - Wikilinks `[[Page]]` / `[[Page|Alias]]` → `/posts/slug` links
   - Image embeds `![[image.jpg]]` → standard image nodes
   - Comments `%%...%%` → removed
   - Highlights `==text==` → `<mark>text</mark>`

2. **`remarkImageProcessing`** (`src/utils/remark-image-processing.ts`) — consolidated image pipeline:
   - Path resolution: bare filenames → `./attachments/filename`, vault-absolute paths → relative
   - Captions: image `title` attribute → `data-caption` HTML attribute
   - Inline gallery: consecutive image-only paragraphs → `<div class="gallery-grid">` / `<div class="gallery-single">` with `.gallery-item` wrappers

3. **`remarkCallouts`** (`src/utils/remark-callouts.ts`) — Obsidian callout syntax:
   - `> [!note]`, `> [!warning]`, etc. → styled `<div class="callout callout-{type}">` blocks
   - Supports collapsible variants: `[!type]+` (open) and `[!type]-` (collapsed)
   - Supported types: `note`, `tip`, `important`, `warning`, `caution`, `danger`, `info`, `question`, `success`, `failure`, `bug`, `example`, `quote`, `abstract`, `summary`, `tldr`

### Gallery System

Posts can have a dedicated gallery rendered after the post body. Images are stored in `src/content/posts/{postDir}/gallery/`.

**`src/utils/image.utils.ts`** — gallery utilities:
- `getGalleryImages(filePath)` — returns sorted `GalleryImage[]` from `gallery/` subdirectory
- `hasGallery(filePath)` — boolean check for conditional rendering
- `filenameToAlt(filename)` — converts `01-rajgad-summit.jpg` → `Rajgad Summit`
- `extractPostDir(filePath)` — derives post folder name from `entry.filePath`

**`PostGallery.astro`** — renders the gallery section; passed via `slot="after"` in `BlogLayout`. Uses GLightbox (npm package, not CDN) for lightbox behaviour. Filenames are sorted alphabetically — prefix with numbers (`01-`, `02-`) to control order.

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
- Layout patterns (post-content, post-meta, content-header)
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
- `seo`, `head` → injected into `<head>`
- `header` → page/post title area
- `meta` → post metadata region
- `navigation` → contextual navigation (series nav, prev/next)
- `after` → supplementary content (gallery, related posts)
- `scripts` → page-specific scripts
- default `<slot />` → main content

## Component System
Each component is self-contained with its own semantic class.

- `Head.astro` — `<head>` scaffold: fonts, meta, RSS/sitemap links, ThemeInit
- `Header.astro` — sticky nav, theme toggle, mobile hamburger; owns theme/mobile toggle scripts
- `Footer.astro` — copyright + social links from siteConfig
- `Container.astro` — responsive width wrapper; props: `setWidth` (sm/md/lg/xl/2xl), `class`
- `ContentHeader.astro` — `<h1>` title + optional meta slot; `pagefind` prop for data-pagefind-meta; styles in `components.css` (`.content-header`)
- `SEO.astro` — meta/og/twitter tags; props: title, description, type, publishedTime, tags, image, noindex
- `ThemeInit.astro` — inline FOUC-prevention script; reads localStorage → prefers-color-scheme → sets `style.colorScheme`
- `PostMeta.astro` — post date, reading time, tags
- `PostItem.astro` — single post card/list entry
- `PostList.astro` — renders a list of PostItems
- `PostCategory.astro` — category/section label for post grouping
- `Tag.astro` — single tag pill/link
- `TagList.astro` — renders a list of Tags
- `Pagination.astro` — prev/next page controls
- `SeriesNav.astro` — `<details>` series listing with prev/next navigation
- `Search.astro` — Pagefind UI loader + URL query persistence
- `Breadcrumb.astro` — breadcrumb trail component
- `ScrollToTop.astro` — scroll-to-top button (rendered by BaseLayout)
- `ImageWrapper.astro` — Astro `<Image>` wrapper with optional bare mode
- `GalleryImage.astro` — single gallery image with GLightbox anchor
- `GalleryInit.astro` — GLightbox initialisation helper
- `PostGallery.astro` — full gallery section (`slot="after"`); reads from `gallery/` subdirectory
- `NavBar.astro` — placeholder (currently empty)

## Do Not
- Add logic to BaseLayout
- Use inline Tailwind for typography
- Add typography rules to base.css — typography.css owns all prose element defaults
