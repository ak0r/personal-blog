# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.6.0 - 2026-03-26

### Added

- **`Logo.astro`** — inline SVG component for site logo; renders paths directly with `fill="currentColor"` so the logo inherits theme color and switches with light/dark mode; replaces `<img>` approach which isolated the SVG from CSS
- **`PostNav.astro`** — prev/next post navigation component; card-style links with direction labels; sorted by date; mobile: flex-col stacked layout; `min-height: 5rem` on links for balanced sizing when titles differ in length
- **`CopyMarkdown.astro`** — copy-as-markdown button using defuddle.md API; three feedback states: default (copy icon), success (check icon + "Copied!" + `✅` title prefix for 2s), failed (x icon + "Failed" for 2s then opens defuddle in new tab as fallback); distinguishes HTTP errors from network/clipboard errors via `res.ok` check
- **`ContentHeader.astro`** — `subheading?: string` prop; renders in Newsreader font at `text-lg text-foreground-subtle` below the main title
- **`Icon.astro`** — added icons: `calendar`, `clock`, `hash`, `map-pin`, `compass`, `cpu`, `tag`, `arrow-left`, `arrow-right`, `copy`, `check`, `x`
- **`PostMeta.astro`** — `updated?: Date` prop; shows "Updated" label + updated date when present and `showFull` is true; icons (calendar, clock, hash) visible in full post context only
- **`PostCategory.astro`** — category icon (`compass` for travel, `cpu` for tech) rendered via `Icon.astro` alongside badge
- **`SchemaOrg.astro`** — `dateModified` uses `updated ?? published`
- **`breadcrumb.utils.ts`** — `CATEGORIES` array for generalised category detection; handles `/posts/travel` and `/posts/tech` category pages; strips pagination path segments
- **`image.utils.ts`** — `allAttachmentImages` glob for `src/content/posts/**/attachments/`; `getCoverImage()` strips Obsidian `[[]]` wikilink syntax and resolves vault paths to glob keys
- **`content.utils.ts`** — `getRelatedPosts()` scoring system: same category + shared tag = 3, same category = 2, shared tag = 1; sorted by score desc then date desc; fallback to recent posts
- **`remark-image-processing.ts`** — Case 2 added for collection-root paths (e.g. `pages/attachments/me-wide.jpg`); `loading: 'lazy'` applied to all processed images
- **`post.schema.ts`** — `updated: z.coerce.date().optional()` and `lang: z.string().optional()` fields
- **`page.schema.ts`** — `lang: z.string().optional()` field
- **Dynamic category pages** — `src/pages/posts/[category]/[...page].astro`; `CATEGORY_META` defined inside `getStaticPaths` for Astro module scope compatibility; travel + tech routes with category-aware breadcrumbs and OG images
- **OG image system rewritten** — both endpoints now use `@vercel/og` (`ImageResponse`) for consistency and Astro 6 build compatibility; `astro-og-canvas` removed
  - `src/pages/og/posts/[...slug].png.ts` — per-post images with Rubik font via Fontsource API; category badge, left colour border, author avatar, date
  - `src/pages/og/[page].png.ts` — static page images (default, posts, posts-travel, posts-tech, tags, about, search); plain `getStaticPaths` function, no `await OGImageRoute`
- **Sitemap priority tiers** — `astro.config.mjs` `serialize` callback: homepage 1.0, category pages 0.8, posts 0.7, static pages 0.6, tags 0.5, search/404 0.3
- **Theme color meta** — `Head.astro`: `#faf9f5` light, `#141413` dark
- **`robots.txt`** — `public/robots.txt` with `Allow: /` and sitemap reference
- **Reading progress bar** — `site-header::after` pseudo-element; `animation-timeline: scroll()`; `bottom: -2px` to clear `border-b`; `@keyframes reading-progress` (scaleX 0→1); accent color
- **Header scroll shadow** — corrected `animation-range: 0px 1px` so shadow appears on first pixel of scroll
- **Mobile menu Escape key** — `keydown` listener closes nav when `Escape` pressed and menu is open
- **ScrollToTop fade** — CSS `animation-timeline: scroll()` with `animation-range: 0px 300px` fades button in after 300px scroll; replaces JS-based `hidden` attribute toggle
- **`siteConfig.logo`** — optional `logo?: string` field added to `SiteConfig` interface; `Header.astro` renders `<Logo />` component when set, site title text as fallback

### Changed

- `Header.astro` — brand renders `<Logo />` inline (not `<img>`); single `<a>` wrapper replacing previously nested anchors; Escape key closes mobile menu
- `BlogLayout.astro` — cover image resolved via `getCoverImage()` returning `ImageMetadata`; rendered with `<Picture>` (loading eager, formats avif/webp, width 900); `ogImage` passed as `/og/posts/${entry.id}.png`
- `GalleryImage.astro` — width 360, height 240, quality 78
- `ImageWrapper.astro` — `quality` prop added (default 80)
- `SEO.astro` — `ogImage` prop takes priority over `image`; fallback to `/og/default.png`
- `[page].png.ts` — migrated from `astro-og-canvas` `OGImageRoute` to `@vercel/og` `ImageResponse`; matches design and code patterns of `[...slug].png.ts`
- `layout.css` — reading progress `@keyframes` renamed from `progress-grow` to `reading-progress` (was mismatched); `bottom: -2px` on `::after`; `PostNav` `.post-nav__link` gets `min-height: 5rem`; `.scroll-to-top` uses scroll-driven opacity animation
- `astro.config.mjs` — sitemap `serialize` callback added; CSP extended for Cloudflare Analytics

### Removed

- `astro-og-canvas` dependency — replaced by `@vercel/og` for both OG image endpoints
- `CopyMarkdown` silent catch fallback — now shows explicit failed state before opening fallback tab

## 0.5.0 - 2026-03-25

### Added

- **Primitive CSS system** (`primitives.css`) — three composable design primitives:
  - `.badge` — inline label with `--subtle`, `--outline`, `--ghost` variants and `--accent`, `--olive`, `--sky`, `--clay` color modifiers
  - `.btn` — interactive element with `--ghost`, `--subtle`, `--solid` variants and `--sm`, `--md`, `--icon` sizes; `rounded-full` throughout
  - `.card` — surface primitive with `--interactive` (hover: `bg-background-minimal` + `shadow-sm`), `--flat`, and `--padded` modifiers; borderless at rest
- **CSS split into three layers**: `primitives.css` (design primitives), `layout.css` (site chrome), `components.css` (content layer); import order updated in `global.css`
- **Header scroll shadow** — pure CSS via `animation-timeline: scroll()` + `animation-range: 0px 1px`; no JS scroll listener
- **Mobile menu fixes** — hamburger hidden on desktop via `#nav-toggle { display: none }` / shown at `max-width: 640px`; slide-down entrance animation; touch-target sized nav links (`py-2.5 px-3 rounded-lg`); closes on nav link click, on resize to desktop, and on `astro:after-swap`
- **`SchemaOrg.astro`** — JSON-LD structured data component supporting three types:
  - `BlogPosting` — used in `BlogLayout`; includes `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `inLanguage`, `keywords`, `mainEntityOfPage`
  - `BreadcrumbList` — rendered inside `Breadcrumb.astro` from shared crumb data
  - `WebSite` with `SearchAction` — used on homepage; points to Pagefind `/search` route
- **`breadcrumb.utils.ts`** — `Crumb` type and `buildCrumbs()` extracted from `Breadcrumb.astro`; shared between visual breadcrumb and JSON-LD schema
- **`lang` frontmatter field** — `z.string().optional()` added to both `post.schema.ts` and `page.schema.ts`; BCP 47 language tag (e.g. `en`, `mr`, `hi`); used by `BlogPosting` schema `inLanguage` field, defaults to `'en'`
- **Cloudflare Web Analytics** — beacon script added to `Head.astro`; production-only guard via `import.meta.env.PROD && CF_ANALYTICS_TOKEN`; token loaded from `.env.production` via `CF_ANALYTICS_TOKEN` env var
- **Dynamic OG images** via `astro-og-canvas`:
  - `src/pages/og/posts/[...slug].ts` — per-post OG images at `/og/posts/{id}.png`; uses `import.meta.glob` for Astro 6 compatibility; category-aware left border (olive for travel, sky for tech, accent teal for default); light slate-050 background
  - `src/pages/og/[page].png.ts` — static page OG images at `/og/default.png`, `/og/posts.png`, `/og/tags.png`, `/og/about.png`, `/og/search.png`

### Changed

- `Tag.astro` — uses `.badge.badge--ghost.badge--accent` instead of ad-hoc `.tag` styles
- `PostCategory.astro` — uses `.badge.badge--subtle.badge--{olive|sky}` with `colorMap`; travel maps to `badge--clay` (updated), tech maps to `badge--sky`
- `PostItem.astro` — wrapper changed to `.card.card--interactive.card--padded.post-item`; `post-item-link` renamed to `post-item__link` for BEM consistency
- `Header.astro` — theme toggle and mobile menu toggle use `.btn.btn--ghost.btn--icon`; mobile toggle renders SVG hamburger icon instead of `☰` character; mobile dropdown inner wrapper changed from `<div class="container">` to `<div class="site-header__mobile-inner">`; JS script wrapped in `initMobileNav()` function with `astro:after-swap` re-initialisation
- `SeriesNav.astro` — `.series-nav__list` uses `bg-background-subtle rounded-lg` inset card treatment instead of `border-t border-border`; outer border retained; `rounded-md` → `rounded-lg`
- `Breadcrumb.astro` — imports `buildCrumbs()` from `breadcrumb.utils.ts`; renders `SchemaOrg type="breadcrumb"` inline
- `BlogLayout.astro` — adds `SchemaOrg type="article"`; passes `ogImage="/og/posts/${entry.id}.png"` to `SEO`; cover image retained as display-only via `image` prop
- `SEO.astro` — new `ogImage` prop takes priority over `image` for OG/Twitter tags; fallback chain: `ogImage → image → /og/default.png`
- `index.astro` — adds `SchemaOrg type="website"`; explicit `ogImage="/og/default.png"` passed to SEO
- `astro.config.mjs` — CSP updated: `script-src` adds `https://static.cloudflareinsights.com`; `connect-src` adds `https://cloudflareinsights.com`
- `layout.css` — header scroll shadow via `@keyframes header-shadow` + `animation-timeline: scroll()`; mobile menu entrance via `@keyframes mobile-menu-in`; hamburger visibility via `#nav-toggle` ID selector; mobile nav link styles with proper touch targets and active state
- `components.css` — `series-nav__list` drops `border-t` in favour of inset surface; `.series-nav` border-radius updated to `rounded-lg`

### Removed

- `PageHeader.astro` reference styles (superseded in 0.2.0, now fully absent from CSS)
- `.tag` ad-hoc styles (replaced by `.badge` primitive)
- `.post-category-tag` and `.post-category-tag--{travel|tech}` (replaced by `.badge--subtle` + color modifiers)
- `.theme-toggle` standalone class (replaced by `.btn.btn--ghost.btn--icon`)
- `.site-header__mobile-toggle` standalone class (replaced by `.btn.btn--ghost.btn--icon` + ID-based visibility)
- `.card` single-line stub `@apply p-2` (replaced by full `.card` primitive system)
- `astro-og-canvas` `cacheDir`-dependent default OG endpoint (removed; replaced by `[page].png.ts` static pages map)

## 0.3.0 - 2026-03-18

### Added

- Anthropic Slate scale (`--color-slate-000` through `--color-slate-1000`) in `tokens.css` — raw color primitives used as theme token inputs
- Muul semantic token system in `theme.css`: three-tier tokens for background (`--background`, `--background-subtle`, `--background-minimal`), foreground (`--foreground`, `--foreground-subtle`, `--foreground-minimal`), border (`--border`, `--border-subtle`, `--border-minimal`), and accent (`--accent`, `--accent-subtle`, `--accent-minimal`)
- All semantic tokens resolve via native CSS `light-dark()` — no separate `:root` / `.dark` overrides required

### Changed

- `tokens.css` expanded: previously only held layout scale and named accent colors; now also contains the full Anthropic Slate primitive scale and system colors (`--color-focus`, `--color-error`)
- `theme.css` fully rewritten: replaced BasecoatUI shadcn-style dual-block (`:root` + `.dark {}`) with a single `:root` block using `light-dark()` for every semantic token; `@theme inline` block trimmed to Muul tokens only
- Dark mode mechanism changed from `.dark` class on `<html>` to `style.colorScheme` property on `:root` (`document.documentElement.style.colorScheme = 'dark' | 'light'`)
- `ThemeInit.astro` updated: sets `style.colorScheme` instead of toggling `.dark` class
- `Header.astro` theme toggle updated: reads/writes `style.colorScheme` instead of `classList`
- `components.css` + `typography.css` token sweep: `text-muted-foreground` → `text-foreground-subtle`, `bg-muted` → `bg-background-subtle`, `text-secondary-foreground` → `text-foreground-subtle`
- `components.css` raw var sweep: `var(--muted-foreground)` → `var(--foreground-subtle)`, `var(--color-muted-foreground)` → `var(--color-foreground-subtle)`, `var(--color-travel)` → `var(--color-olive)`, `var(--color-tech)` → `var(--color-sky)`, gallery focus outline changed from `var(--accent)` → `var(--color-focus)`
- Icon visibility selectors updated: `html.dark .icon-*` → `:root[style*="dark"] .icon-*`
- `base.css` rewritten: removed BasecoatUI-sourced `* { @apply border-border outline-ring/50; }` universal reset; focus ring now uses `var(--color-focus)` directly instead of `@apply outline-primary`
- `Tag.astro` no longer applies `badge-outline` class (BasecoatUI-specific utility)

### Removed

- `basecoat-css` npm dependency
- All BasecoatUI-specific tokens: `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--destructive`, `--input`, `--ring`, `--chart-1` through `--chart-5`, `--sidebar-*` family
- `@custom-variant dark` declaration
- Tailwind bridge entries for all removed tokens
- `--color-travel` and `--color-tech` aliases in `@theme inline` (replaced by direct `--color-olive` and `--color-sky` references)

## 0.2.0 - 2026-03-17

### Added

- `ContentHeader.astro` — replacement for `PageHeader`; uses BEM class naming (`.content-header`, `.content-header__title`, `.content-header__meta`); styles live in `components.css`
- `pagefind` and `@pagefind/default-ui` added as explicit dependencies
- Build script now runs `pagefind --site dist` post-build and copies the index to `public/` automatically

### Changed

- `PageHeader.astro` replaced by `ContentHeader.astro` across all consumers: `BlogLayout`, `PageLayout`, `posts/[...page]`, `search.astro`, `tags/index.astro`, `tags/[tag].astro`
- Header BEM rename: `site-nav` → `site-header__nav`, `brand` → `site-header__brand`, `nav-desktop` → `site-header__desktop`, `nav-end` → `site-header__end`, `nav-mobile-toggle` → `site-header__mobile-toggle`, `nav-mobile` → `site-header__mobile`
- Pagination BEM rename: `pagination-link` → `pagination__link`, `is-disabled` → `pagination__link--disabled`, `pagination-info` → `pagination__info`; inline `<style>` removed, styles in `components.css`
- SeriesNav BEM rename: all `series-*` flat classes → `series-nav__*`; inline `<style>` removed, styles in `components.css`
- `Search.astro` inline `<style>` removed; Pagefind UI CSS custom property overrides centralized in `components.css`
- `ThemeInit` moved from `BaseLayout.astro` into `Head.astro` — FOUC-prevention script now co-located with `<head>` setup
- Global CSS resets (`* { border-border; outline-ring/50 }`, `body { bg-background text-foreground }`) moved from `theme.css` into `base.css`
- Site URL updated from `agrima.amitkul.in` → `base.amitkul.in`; package name updated from `agrima` → `astro-base`
- Related posts list changed from `<ul>` to `<div>` for semantic consistency with `PostList`

### Fixed

- SeriesNav ordered counter pseudo-element (`::before`) was using `@apply text-muted` which maps to the background-toned `--muted` color token, making counter numbers invisible; replaced with `color: var(--muted-foreground)`

### Removed

- `PageHeader.astro` component (superseded by `ContentHeader.astro`)
- Stray `import mdx` removed from `src/site.config.ts`

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
