# Content Contract

Authoritative reference for what goes in `src/content/` and how it's
turned into pages. Schemas are defined in `src/content.config.ts` — this
document explains the fields, the file/directory conventions, and the
markdown syntax the pipeline understands. If this file and the code ever
disagree, the code wins; update this file to match.

## Collections

| Collection | Loader | Source | Routed at |
|---|---|---|---|
| `posts` | `glob('**/*.{md,mdx}')` | `src/content/posts/` | `/posts/<slug>/` |
| `notes` | `glob('**/*.{md,mdx}')` | `src/content/notes/` | `/notes/<slug>/` |
| `pages` | `glob('**/*.{md,mdx}')` | `src/content/pages/` | `/<slug>/` (root, no prefix) |
| `siteConfig` | `file('src/content/site/config.yaml')` | one YAML file | not routed — read via `getConfig()` |

## `posts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `description` | string | no | used as the meta description and OG description |
| `published` | date | yes | drives sort order, the `years` browse dimension, and future-post hiding |
| `updated` | date | no | if set, shown instead of `published` and used as the sort key |
| `category` | string | no | defaults to `"Travels"` if omitted; feeds the `category` browse dimension |
| `tags` | string[] | no | lowercased and de-duplicated on load; feeds the `tags` browse dimension |
| `cover` | string | no | see [Cover image](#cover-image) |
| `featured` | boolean | no, default `false` | accepted by the schema; **not read anywhere in the UI** |
| `draft` | boolean | no, default `false` | hidden in production builds (`import.meta.env.DEV` bypasses this) |
| `lang` | string | no | not currently rendered |
| `series` / `seriesOrder` | string / number | no | `getSeriesArticles()` exists in `src/utils/content.ts` but is not called from any page — series grouping is not wired up |
| `meta` | `Record<string, string \| string[]>` | no | free-form; see [Browse dimensions](#browse-dimensions) |

Future-dated posts (`published` in the future) and `draft: true` posts are excluded from `getAllPosts()` in production; both are shown in `astro dev` regardless.

### File layout

Two supported layouts, both live under `src/content/posts/`:

- **Flat** — one `.md`/`.mdx` file directly in `posts/`, images in a shared `posts/attachments/` folder. Example: `src/content/posts/on-rereading.md`.
- **Nested (one directory per entry)** — `posts/<...path>/<slug>/index.md`, with its own sibling `attachments/` folder. Example: `src/content/posts/_travels/_2011/bhuleshwar/index.md` + `.../bhuleshwar/attachments/*.jpg`.

Path segments starting with `_` (e.g. `_travels`, `_2011`, `_markdown-test`) are loaded normally but stripped from the public URL by `getPostPathSegments()` — they're purely organizational (vault-archive folders), not drafts.

### Cover image

`cover` accepts, via `normalizeCoverPath()` (`src/utils/image.ts`):

- An Obsidian wikilink: `"[[posts/_travels/_2011/bhuleshwar/attachments/focused.jpg]]"`
- A markdown link: `"[label](path/to/image.jpg)"`
- A raw vault-absolute path: `"posts/on-rereading/attachments/cover.jpg"`

The resolved path is looked up directly against an `import.meta.glob('/src/content/**/attachments/*.{jpg,jpeg,png,webp,avif,gif}')` map, so cover images resolve correctly at any nesting depth. If the path doesn't match a real file, `getCoverImage()` returns `undefined` and the cover is silently omitted — no build error.

### Inline body images

`![alt](path)` in the markdown body is normalized by `resolveVaultImageUrl()` (`src/plugins/satteri-gallery.ts`) before Astro's image pipeline sees it:

- `http(s)://...` — left alone.
- Already `/...`, `./...`, or `../...` — left alone.
- Bare filename (`foo.jpg`, no `/`) — becomes `./attachments/foo.jpg`.
- Already prefixed `attachments/...` or `images/...` — becomes `./attachments/...` / `./images/...`.
- Vault-absolute, collection-prefixed (`posts/<...>/attachments/foo.jpg`) — resolved **relative to the current file's own directory**, so this works for both flat and nested posts.

Consecutive image-only paragraphs are merged into a `.gallery-single`/`.gallery-grid` block by `galleryGrouping()` — write consecutive `![]()` lines with no text between them to get a grid instead of one image per row.

### Dedicated galleries (`gallery/` folder)

`getPostGallery()` (`src/utils/image.ts`) reads `src/content/posts/<postDir>/gallery/*.{jpg,png,...}`, where `<postDir>` is just the file's immediate parent directory name.

**This only works for flat, one-level-deep post directories** (e.g. `posts/_markdown-test/gallery/`). For a nested entry like `posts/_travels/_2011/bhuleshwar/`, `<postDir>` resolves to `bhuleshwar`, but the lookup is hardcoded to `/posts/bhuleshwar/gallery/` — it will not find images actually sitting at `/posts/_travels/_2011/bhuleshwar/gallery/`. Nested posts should use grouped inline images (above) instead of a `gallery/` folder until this is fixed.

### Slug / URL generation — nested-post gotcha

`getPostSlugPath()` joins two things: the directory segments (via `getPostPathSegments()`, underscore-dirs stripped) and the entry's `id` (via `getPostSlugSegment()`, last `/`-segment of `id`).

Astro's default `id` for a glob-loaded entry is **the frontmatter `slug` field, if present** (this is Astro's own loader behavior, not something this template controls) — otherwise it falls back to the file's own path-derived slug.

If a nested post's frontmatter sets `slug:` to the same value as its own directory name (as `bhuleshwar/index.md` currently does — `slug: bhuleshwar`), the directory segment and the id segment are identical and get joined together, producing a doubled URL: `/posts/bhuleshwar/bhuleshwar/`. **For nested posts, omit the frontmatter `slug` field** and let the directory name be the only source of the final segment.

## `notes`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `description` | string | no | not rendered in `NoteFeedItem`, only usable via `og:description` on the note's own page |
| `published` | date | yes | |
| `updated` | date | no | |
| `draft` | boolean | no, default `false` | **not enforced** — `isVisibleNote()` only hides future-dated notes, unlike posts |
| `category` | string | no | no default (unlike posts' `"Travels"` default); feeds the `category` browse dimension |
| `color` | string | no | accepted by the schema; **not read anywhere in the UI** |
| `tags` | string[] | no | same normalization as posts |
| `lang` | string | no | not currently rendered |
| `meta` | same as posts | no | same browse-dimension mechanism as posts |

Notes live flat in `src/content/notes/*.md` with wikilink-style cross-references (`[[Other Note Title]]`, `[[Other Note#Heading]]`) resolved to `/notes/<slug>` by `wikilinkResolver` (`src/plugins/satteri.ts`). `buildBacklinkMap()` (`src/utils/content.ts`) scans note bodies for both wikilinks and literal `[text](/notes/slug)` markdown links to build a reverse-reference map — check where it's called before assuming backlinks are rendered somewhere; it is not wired into any page as of this writing.

## `pages`

| Field | Type | Required |
|---|---|---|
| `title` | string | yes |
| `description` | string | no |
| `updated` | date | no |
| `lang` | string | no |

Routed at the site root with no `/pages/` prefix (`getPageUrl()`), e.g. `src/content/pages/about.md` → `/about`.

## `siteConfig` (`src/content/site/config.yaml`)

Single YAML file, loaded as one entry with `id: config`. Validated fields: `title`, `description`, `url`, `locale`, `author.{name,bio,url,avatar}`, `logo`, `navigation[]`, `footerLinks[]`, `social[]` (`icon` restricted to `github | mastodon | twitter | rss | email`), `heroText`, `footerCredits`, `postsPerPage`, `recentPosts`, `showLogo`, `browse.dimensions[]`.

`getConfig()` (`src/utils/config.ts`) shallow-merges this file over `defaultConfig` in `src/site.config.ts` — only set the fields you want to override. `author` is merged one level deep (partial author overrides don't wipe sibling fields); everything else is a full replace, including `browse.dimensions` and `navigation`.

## Markdown features

Enabled via the Sätteri processor in `astro.config.mjs`:

- **Wikilinks**: `[[Note Title]]`, `[[Note Title|alias]]`, `[[Note Title#Heading]]`, `[[#Heading]]` (same-page).
- **Highlights**: `==highlighted text==` → `<mark>`.
- **Obsidian comments**: `%%hidden text%%` → stripped entirely from output.
- **Callouts**: `> [!note] Title` / `> [!warning]+ Title` (the `+`/`-` suffix makes it collapsible as a `<details>`) → rendered via `satteri-callouts` (Obsidian theme). Supported types are whatever `satteri-callouts` ships (note, tip, warning, danger, success, question, example, quote, etc.).
- **Container directives**: `:::aside` / `:::annotation`, optional `{date="..."}` attribute → converted to `<div class="aside">`/`<div class="annotation">`.
- **Footnotes, subscript (`~x~`), superscript (`^x^`), smart punctuation** (quotes/dashes/ellipses): GFM-standard, no custom syntax.

## Browse dimensions

Configured under `browse.dimensions` in `site/config.yaml`, each entry: `{ key, slug, title }`.

- `key: published` — built-in, groups by `published.getFullYear()`.
- `key: category` — built-in, groups by `data.category`.
- `key: tags` — built-in, groups by each tag in `data.tags`.
- Any other `key` — resolves to `data.meta[key]` (string or string[]). Unconfigured `meta` keys are simply not browsable; they don't error.

Routes: `/browse/` (all dimensions with any values), `/browse/<slug>/` (that dimension's values + counts), `/browse/<slug>/<value>/` (matching posts and notes, rendered as separate "Posts"/"Notes" sections). Values are matched by `slugify()`, so `"Japan 2026"` and `"japan-2026"` resolve to the same page.

## Related content

Each post/note detail page renders `<RelatedContent entry={...} />`, which re-runs every configured browse dimension against that single entry (`getBrowseValuesForEntry()` in `src/utils/browse.ts`) and lists the entry's own values per dimension as links back into `/browse/<slug>/<value>/` — e.g. a post shows its own Year, Category, Tags, Trip as a cross-reference list, not a curated set of other posts.

`src/utils/related.ts` (`getRelatedEntries()`, a category/shared-tag scoring function that picks *other* similar entries) still exists in the codebase and is still imported by `src/pages/posts/[...slug].astro`, but its result is no longer passed to `RelatedContent` — check whether that's intentional before relying on it; `src/pages/notes/[...slug].astro` does not import it at all.

## Fields defined but not currently rendered anywhere

Useful to know before spending time on frontmatter that has no visible effect: `posts.featured`, `posts.series` / `posts.seriesOrder`, `posts.lang`, `notes.lang`, `notes.color`, `notes.description` (only in `<meta>` tags, not in the note listing), `pages.lang`.

Any frontmatter key not listed in the schema tables above (e.g. `countries`, `theme` as seen in some sample content) is silently dropped by Zod — it does not error, it just isn't available on `entry.data`.
