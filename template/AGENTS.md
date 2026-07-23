## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

If you change a markdown-processing plugin (`src/plugins/satteri.ts`,
`src/plugins/satteri-gallery.ts`, or the `markdown.processor` config in
`astro.config.mjs`) and the output doesn't reflect your change on rebuild,
clear the content cache before concluding the fix didn't work:

```
rm -rf .astro node_modules/.astro/data-store.json node_modules/.astro/assets
```

Astro's content layer caches rendered markdown output keyed by source-file
content, not by processor logic — editing a `.ts` plugin file doesn't
invalidate it.

## Content architecture

Content lives in `src/content/{posts,notes,pages}/` plus one site-config
YAML file at `src/content/site/config.yaml`. The full frontmatter schema,
file-layout rules (flat vs. nested posts, image path resolution, cover
images, galleries), supported markdown syntax (wikilinks, callouts,
highlights, directives), the browse-dimension system, and known gotchas
(e.g. nested posts can get a doubled URL segment if their frontmatter
`slug` matches their own directory name) are documented in
[CONTENT_CONTRACT.md](./CONTENT_CONTRACT.md) — read it before adding
schema fields, new content-collection loaders, or touching the
`src/plugins/satteri*.ts` files. Keep it in sync with
`src/content.config.ts` when either changes.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
