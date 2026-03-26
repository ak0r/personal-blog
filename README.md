# astro-base

A personal blog template built on Astro 6. Opinionated, minimal, content-first.

---

## Features

- **Astro 6** static site generation
- **TailwindCSS v4** with a custom semantic token system
- **MDX** content with Obsidian-compatible image handling
- **Pagefind** full-text search (post-build)
- **GLightbox** image galleries with dark mode support
- **Expressive Code** syntax highlighting
- **Dynamic OG images** via `@vercel/og` — per-post and per-page
- **JSON-LD structured data** — BlogPosting, BreadcrumbList, WebSite
- **Three-way theme toggle** — light / dark / system
- **Reading progress bar** — pure CSS `animation-timeline`
- **Cloudflare Web Analytics** — production-only, no cookies
- **Category pages** — travel and tech with separate OG images
- **Related posts** — scored by shared category and tags
- **Series navigation** — ordered post sequences with prev/next
- **Copy as Markdown** — via defuddle.md with success/failed feedback

---

## Project structure

```
src/
  components/         Astro components
    Icon.astro        Inline SVG icon system
    Logo.astro        Inline SVG site logo (currentColor theme support)
    PostItem.astro    Post list card
    PostMeta.astro    Date, read time, tags
    PostNav.astro     Prev/next post navigation
    PostCategory.astro Category badge
    SeriesNav.astro   Series accordion
    CopyMarkdown.astro Copy post as markdown
    SchemaOrg.astro   JSON-LD structured data
    Breadcrumb.astro  Breadcrumb trail + schema
    ContentHeader.astro Page title + optional subheading
    SEO.astro         Open Graph + Twitter meta
    Head.astro        <head> — fonts, analytics, meta
    ...
  content/
    posts/            Blog posts (MDX)
    pages/            Static pages (MDX)
  layouts/
    BlogLayout.astro  Post layout — cover, meta, series, related, nav
    PageLayout.astro  Page layout
    BaseLayout.astro  Site shell — header, footer
  pages/
    og/
      posts/[...slug].png.ts    Per-post OG images
      [page].png.ts             Static page OG images
    posts/
      [category]/[...page].astro Category listing pages
      [...slug].astro            Post pages
    tags/[tag]/[...page].astro  Tag listing pages
    search.astro
    404.astro
  schemas/
    post.schema.ts
    page.schema.ts
  styles/
    global.css        Import order: tailwind → glightbox → tokens → theme → base → primitives → layout → components → typography
    tokens.css        Color palette + spacing
    theme.css         Light/dark token mappings
    primitives.css    .badge, .btn, .card
    layout.css        Header, footer, nav, breadcrumb, pagination
    components.css    Post list, galleries, callouts, search
    typography.css    Prose styles
  utils/
    content.utils.ts
    breadcrumb.utils.ts
    image.utils.ts
    string.utils.ts
    remark-image-processing.ts
  site.config.ts      Site metadata, nav, author
public/
  robots.txt
```

---

## Getting started

```bash
npm install
npm run dev
```

```bash
npm run build    # Astro build + Pagefind index
npm run preview  # Preview built site
```

---

## Configuration

Edit `src/site.config.ts`:

```ts
export const siteConfig = {
  title: 'Site Name',
  description: 'Site description',
  url: 'https://example.com',
  author: 'Your Name',
  logo: '/logo.svg',   // optional — path in public/; uses Logo.astro for currentColor support
  nav: [
    { label: 'Posts', href: '/posts/' },
    { label: 'About', href: '/about/' },
  ],
}
```

---

## Content

### Writing posts

Create `src/content/posts/{category}/{YYYY-MM-DD-slug}/index.mdx`:

```mdx
---
title: Post title
description: Short description for SEO and OG images
published: 2025-01-15
updated: 2025-01-20       # optional — shows "Updated" label
category: travel           # or tech
tags: [sahyadri, trekking]
cover: "[[attachments/cover.jpg]]"  # Obsidian wikilink or path
location: Rajgad, Maharashtra
lang: en                   # BCP 47, defaults to en
series: Series Name        # optional
---

Post content here.
```

Place images in `attachments/` inside the post folder.

### Gallery syntax (in MDX)

```mdx
:::gallery
![Caption](attachments/image1.jpg)
![Caption](attachments/image2.jpg)
:::
```

### Callout syntax

```mdx
> [!note] Title
> Content

> [!tip], [!important], [!warning], [!caution]
```

---

## Design system

### Primitives

Three composable CSS primitives in `primitives.css`:

```html
<!-- Badge: variant + color -->
<span class="badge badge--subtle badge--olive">Travel</span>
<span class="badge badge--ghost badge--accent">#tag</span>

<!-- Button: variant + size -->
<button class="btn btn--ghost btn--icon">...</button>
<button class="btn btn--subtle btn--md">Action</button>

<!-- Card: variant modifiers -->
<div class="card card--interactive card--padded">...</div>
```

### Color tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#faf9f5` | `#141413` | Page background |
| `--accent` | `#24837B` | `#3AA99F` | Interactive, links |
| `--color-olive` | `#788c5d` | same | Travel category |
| `--color-sky` | `#6a9bcc` | same | Tech category |
| `--color-clay` | `#d97757` | same | Warnings, errors |

### Icons

Available via `<Icon name="..." size={16} />`:

`calendar` `clock` `hash` `map-pin` `compass` `cpu` `tag` `arrow-left` `arrow-right` `copy` `check` `x` `sun` `moon` `search` `menu`

---

## OG images

Automatically generated at build time for all posts and static pages using `@vercel/og`.

- Per-post: `/og/posts/{post-id}.png` — title, description, category badge, author, date
- Static pages: `/og/default.png`, `/og/posts.png`, `/og/posts-travel.png`, `/og/posts-tech.png`, `/og/tags.png`, `/og/about.png`, `/og/search.png`

Category-aware left border: olive for travel, sky for tech, accent teal for default.

---

## Analytics

Cloudflare Web Analytics. Add your token to `.env.production`:

```bash
CF_ANALYTICS_TOKEN=your_token_here
```

The beacon only loads in production builds.

---

## Deployment (Cloudflare Pages)

```bash
npm run build
```

Publish the `dist/` directory. No adapter needed — Astro static output.

Set `CF_ANALYTICS_TOKEN` in your Cloudflare Pages environment variables for production.