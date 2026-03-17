---
title: "Getting Started with Muul"
description: "How to install, configure, and customise the Muul blog template."
published: 2026-02-27
tags:
  - muul
  - meta
series: Getting Started with Muul
order: 1
---

Muul is an Astro blog template. This post walks through everything you need to get your own site up and running.

## Prerequisites

- Node.js 18 or later
- A basic familiarity with Astro and Markdown

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/muul.git my-blog
cd my-blog
npm install
npm run dev
```

Your site is now running at `http://localhost:4321`.

## Configuration

Everything site-wide lives in `src/site.config.ts`:

```typescript
export const siteConfig = {
  url: "https://yourdomain.com",    // used for canonical URLs and OG tags
  title: "Your Site Title",
  description: "A short description of your site.",
  author: "Your Name",
  social: [
    { title: "GitHub", url: "https://github.com/you", icon: "github" },
  ],
  navigation: [
    { title: "Articles", url: "/posts" },
    { title: "Tags", url: "/tags" },
    { title: "About", url: "/about" },
  ],
  recentPosts: 8,   // posts shown on the home page
  relatedPosts: 4,  // related posts shown at the bottom of each article
};
```

## Writing posts

Create a new Markdown file in `src/content/posts/`:

```markdown
---
title: "My First Post"
description: "A short description shown in metadata."
published: 2026-01-01
tags:
  - writing
  - personal
---

Your content goes here.
```

Available frontmatter fields:

| Field         | Type       | Required | Notes                            |
|---------------|------------|----------|----------------------------------|
| `title`       | string     | yes      |                                  |
| `description` | string     | no       | Used for SEO meta                |
| `published`   | date       | yes      | `YYYY-MM-DD` format              |
| `tags`        | string[]   | no       | Generates `/tags/[tag]` pages    |
| `cover`       | string     | no       | Relative path or absolute URL    |
| `draft`       | boolean    | no       | `true` hides post from all lists |
| `series`      | string     | no       | Groups posts into a series; shows collapsible nav |
| `order`       | number     | no       | Position within the series (ascending) |

## Updating the About page

Edit `src/content/pages/about.md`. The frontmatter `title` and `description` fields feed the page's `<title>` tag and meta description.

## Theming

All colour values are in `src/styles/theme.css` as CSS custom properties. The palette is Flexoki-inspired. To change the look:

1. Open `src/styles/theme.css`
2. Update the `light-dark()` values for any variable
3. Save — the dev server hot-reloads instantly

The template uses `light-dark()` for automatic light/dark switching. The theme toggle in the header overrides this with a stored preference.

To change fonts, update the `--font-primary`, `--font-headings`, and `--font-code` variables and point the Astro `Font` component in `BaseLayout.astro` to your chosen fonts.

## Deploying

Muul works with any static host. For Netlify or Vercel, connect your repository and deploy with the default settings. For Cloudflare Pages or GitHub Pages, add the appropriate Astro adapter.

```bash
npm run build       # builds to ./dist
npm run preview     # preview the build locally
```

That's it. Start writing.