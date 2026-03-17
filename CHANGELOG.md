# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-03-14

### Added

- Astro 6 blog with MDX content support
- Content collections: `posts` and `pages` with Zod schemas (draft filtering, series, tags, cover, order)
- Layout hierarchy: `BaseLayout` → `BlogLayout` / `PageLayout`
- Full component set: `Head`, `Header`, `Footer`, `Container`, `PageHeader`, `SEO`, `ThemeInit`, `PostMeta`, `PostItem`, `PostList`, `Tag`, `TagList`, `Pagination`, `SeriesNav`, `Search`
- TailwindCSS v4 styling with semantic CSS class convention (`@apply`-based)
- Two-layer typography system: `@layer base` global element defaults in `typography.css`, `@layer components` `.post-content` overrides
- Light/dark mode via `.dark` class with FOUC-free toggle via `ThemeInit` inline script; preference persisted to localStorage
- Expressive Code syntax highlighting with `everforest-dark` / `everforest-light` themes keyed by `[data-theme]` attribute
- Custom fonts via Astro font API: Rubik (headings), Poppins (body), Newsreader (prose), Fira Code (code)
- Series navigation with ordered post listing and prev/next links
- Related posts by tag matching with fallback to recent posts
- Tag index and per-tag filtered post lists
- Paginated post archive at `/posts` with configurable `postsPerPage`
- Pagefind full-text search with URL query persistence at `/search`
- RSS feed at `/rss.xml` via `@astrojs/rss`
- XML sitemap via `@astrojs/sitemap`
- Reading time calculation (200 wpm default)
- `siteConfig` central config: site URL, title, author, nav, social links, pagination constants, container width settings (`pageWidth`, `contentWidth`)
- `@/` path alias mapping to `src/`
- Content Security Policy headers via Astro config
- Experimental features: Rust compiler, content intellisense, queued rendering
