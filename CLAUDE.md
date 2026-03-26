# CLAUDE.md — astro-base

Developer context for Claude Code. Read this before touching any file.

---

## Project overview

Astro 6 personal blog template. TailwindCSS v4, MDX, Pagefind search, GLightbox gallery, Expressive Code syntax highlighting. Deployed to Cloudflare Pages.

**Live:** `base.amitkul.in`
**Content:** Obsidian vault synced via Syncthing

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 6 (static, no SSR adapter) |
| Styling | TailwindCSS v4 (`@apply` + CSS custom props) |
| Content | MDX via Astro content collections |
| Search | Pagefind (post-build index) |
| Images | Astro `<Picture>`, GLightbox for galleries |
| OG images | `@vercel/og` (`ImageResponse` + Satori) |
| Analytics | Cloudflare Web Analytics (production-only) |
| Fonts | Rubik (headings), Poppins (body), Newsreader (prose), Fira Code (code) — all via Fontsource |

---

## CSS architecture

Four layers, imported in this order in `global.css`:

```
tailwindcss → glightbox → tokens → theme → base → primitives → layout → components → typography
```

| File | Purpose |
|---|---|
| `tokens.css` | CSS custom properties — color palette, spacing, typography scale |
| `theme.css` | Light/dark theme mappings using `light-dark()` |
| `base.css` | HTML element resets and defaults |
| `primitives.css` | Composable design primitives: `.badge`, `.btn`, `.card` |
| `layout.css` | Site chrome: header, footer, nav, breadcrumb, pagination, scroll-to-top |
| `components.css` | Content layer: post list, post item, post meta, series nav, gallery, callouts, search |
| `typography.css` | Prose styles for MDX content |

### Design primitives (`primitives.css`)

Composable via modifier classes — combine variant + color:

**`.badge`** — inline label
- Variants: `--subtle`, `--outline`, `--ghost`
- Colors: `--accent`, `--olive`, `--sky`, `--clay`
- Example: `.badge.badge--subtle.badge--olive`

**`.btn`** — interactive element
- Variants: `--ghost`, `--subtle`, `--solid`
- Sizes: `--sm`, `--md`, `--icon`
- Example: `.btn.btn--ghost.btn--icon`

**`.card`** — surface container
- Variants: `--interactive` (hover: bg shift + shadow), `--flat`, `--padded`
- No border at rest; borderless design
- Example: `.card.card--interactive.card--padded`

### Design tokens (key values)

```css
/* Backgrounds */
--color-slate-050: #faf9f5   /* page bg light */
--color-slate-950: #141413   /* page bg dark */

/* Accent */
--accent: #3AA99F (dark) / #24837B (light)

/* Category colors */
--color-olive: #788c5d   /* travel */
--color-sky:   #6a9bcc   /* tech */
--color-clay:  #d97757   /* clay/error */
```

---

## Components

### New in 0.6.0

| Component | Location | Purpose |
|---|---|---|
| `Logo.astro` | `src/components/` | Inline SVG logo with `fill="currentColor"` for theme switching |
| `PostNav.astro` | `src/components/` | Prev/next post navigation by date |
| `CopyMarkdown.astro` | `src/components/` | Copy post as markdown via defuddle.md API |
| `ContentHeader.astro` | `src/components/` | Page title with optional `subheading` prop |
| `Icon.astro` | `src/components/` | Inline SVG icon system — see paths map inside |
| `SchemaOrg.astro` | `src/components/` | JSON-LD structured data (BlogPosting, BreadcrumbList, WebSite) |

### Key existing components

| Component | Notes |
|---|---|
| `PostItem.astro` | Uses `.card.card--interactive.card--padded.post-item` |
| `PostMeta.astro` | Shows icons + updated date when `showFull=true` |
| `PostCategory.astro` | `.badge.badge--subtle.badge--{olive\|sky}` + category icon |
| `Tag.astro` | `.badge.badge--ghost.badge--accent` |
| `Header.astro` | Sticky; scroll shadow via `animation-timeline`; reading progress bar via `::after`; Escape closes mobile menu |
| `Breadcrumb.astro` | Uses `buildCrumbs()` from `breadcrumb.utils.ts`; renders inline SchemaOrg |
| `SeriesNav.astro` | `<details>` accordion; list uses `bg-background-subtle rounded-lg` inset card |
| `GalleryImage.astro` | width 360, height 240, quality 78 |
| `ImageWrapper.astro` | `quality` prop, default 80 |
| `SEO.astro` | `ogImage` prop priority over `image`; fallback `/og/default.png` |

---

## Content collections

### Posts (`src/content/posts/`)

```
posts/
  category/
    YYYY-MM-DD-post-slug/
      index.mdx
      attachments/    ← images referenced in frontmatter or MDX
```

**Frontmatter schema** (`post.schema.ts`):

```ts
title: string
description?: string
published: Date          // required
updated?: Date           // optional, shown in PostMeta
category?: 'travel' | 'tech'
tags?: string[]
cover?: string           // Obsidian [[wikilink]] or path
location?: string
lang?: string            // BCP 47, defaults to 'en'
series?: string
draft?: boolean
```

### Pages (`src/content/pages/`)

Simple pages (about, etc.) with `title`, `description`, `lang` fields.

---

## Utilities

| File | Key exports |
|---|---|
| `content.utils.ts` | `getPublishedPosts()`, `getRelatedPosts()` (scoring: same category+tag=3, same category=2, shared tag=1) |
| `breadcrumb.utils.ts` | `buildCrumbs()`, `Crumb` type, `CATEGORIES` array |
| `image.utils.ts` | `getCoverImage()` — resolves Obsidian wikilinks to `ImageMetadata`; `allAttachmentImages` glob |
| `string.utils.ts` | `slugify()`, `stripObsidianBrackets()` |
| `remark-image-processing.ts` | Resolves relative image paths in MDX; handles collection-root paths; adds `loading: lazy` |

---

## OG image system

Two endpoints, both using `@vercel/og` (`ImageResponse`):

- `src/pages/og/posts/[...slug].png.ts` — per-post; category-coloured left border; Rubik font via Fontsource API; author avatar + date footer
- `src/pages/og/[page].png.ts` — static pages (default, posts, posts-travel, posts-tech, tags, about, search); plain `getStaticPaths` function

**Do not use `astro-og-canvas`** — it was removed due to Astro 6 build incompatibility.

Palette used in OG images matches site tokens: slate-050 background, slate-950 text, olive/sky/accent borders per category.

---

## Routing

```
/                           index.astro
/posts/                     posts/index.astro (paginated)
/posts/travel/              posts/[category]/[...page].astro
/posts/tech/                posts/[category]/[...page].astro
/posts/[...slug]/           posts/[...slug].astro
/tags/                      tags/index.astro
/tags/[tag]/                tags/[tag]/[...page].astro
/search/                    search.astro
/about/                     pages/about.astro (or content page)
/og/posts/[...slug].png     OG image per post
/og/[page].png              OG image per static page
```

---

## Site config (`src/site.config.ts`)

```ts
interface SiteConfig {
  title: string
  description: string
  url: string
  author: string
  logo?: string        // path to Logo SVG in public/; renders Logo.astro when set
  nav: { label: string; href: string }[]
  // ...
}
```

---

## Header behaviour

- Sticky, `z-50`, `isolation: isolate`
- Scroll shadow: CSS `animation-timeline: scroll()`, `animation-range: 0px 1px`
- Reading progress: `::after` pseudo, `animation-timeline: scroll()`, `bottom: -2px` clears `border-b`
- Mobile menu: checkbox toggle (`#nav-toggle`); closes on link click, window resize, `astro:after-swap`, and `Escape` key
- Logo: `<Logo />` component (inline SVG), falls back to `siteConfig.title` text

---

## Logo

`src/components/Logo.astro` — inline SVG with `fill="currentColor"` and `viewBox="0 0 2000 400"`. No `width`/`height` attributes; sized via CSS `.site-header__logo { height: 2rem; width: auto }`.

**Why inline?** `<img src="logo.svg">` isolates the SVG from page CSS — `currentColor` can't inherit. Inline SVG participates in the CSS cascade.

---

## Environment variables

```bash
CF_ANALYTICS_TOKEN=   # Cloudflare Web Analytics token (.env.production only)
```

Analytics beacon only fires in production (`import.meta.env.PROD`).

---

## Build notes

- `astro build` runs Pagefind after build via integration hook
- OG images are statically generated at build time — no runtime image generation
- `robots.txt` is in `public/` — manually maintained
- Sitemap generated by `@astrojs/sitemap` with priority tiers via `serialize` callback

---

## Conventions

- BEM class naming for components: `.post-item__link`, `.series-nav__title`
- Primitive + component class stacking: `.card.card--interactive.card--padded.post-item`
- No inline styles — use CSS custom properties or `@apply`
- Images in posts: Obsidian `[[wikilink]]` syntax in frontmatter `cover`; standard markdown `![alt](path)` in MDX body
- All dates via `z.coerce.date()` in schemas
- `getPublishedPosts()` filters `draft: true` and future `published` dates