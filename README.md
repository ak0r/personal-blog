# personal-blog

Orchestration and deployment for a personal website built from two
independent repositories: a template (Astro app) and content (Markdown +
media). This repo owns neither — it syncs both into place, builds, and
deploys. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design and
the reasoning behind it.

## Prerequisites

- Node.js >= 22.12.0
- pnpm
- `rsync` (used by the local sync scripts)

## Install

```sh
pnpm install
```

## Local development

```sh
pnpm dev
```

This runs `pnpm sync` (template + content sync) and then starts the Astro
dev server from `template/`.

By default, local sync pulls from sibling checkouts on disk:

| Env var | Default | Purpose |
|---|---|---|
| `TEMPLATE_SRC` | `$HOME/devhome/astrordinary` | local template checkout to sync from |
| `BLOG_VAULT` | `/mnt/d/my-data/notes/personal-blog-content` | local content vault to sync from |

Point these at your own checkouts if they live elsewhere:

```sh
TEMPLATE_SRC=/path/to/astrordinary BLOG_VAULT=/path/to/vault pnpm dev
```

Other scripts:

```sh
pnpm sync-template   # sync template only
pnpm sync-content    # sync content only
pnpm sync-dry         # dry run both (no files changed)
pnpm build            # sync + build the Astro site
pnpm preview           # preview the production build
```

## Important: `template/` and `content/` aren't the source

`template/` is a plain sync target, overwritten on every sync — **never
hand-edit files inside it**, edits are silently discarded. `content/` is a
git submodule pointing at `personal-blog-content`; local sync overlays your
Obsidian vault on top of it for previewing unpublished changes, which is
fine and expected to leave it locally dirty — just never commit content
changes from this repo. Content edits belong in the content repo (or the
vault, then push); this repo only ever tracks which content commit it's
pinned to.

## Production deploy

Content or template repo pushes dispatch a `repository_dispatch` event to
this repo's [fetch-content.yml](.github/workflows/fetch-content.yml)
workflow, which syncs both, commits the result, and pushes — Cloudflare
then builds from this repo's `main` branch. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for the full flow.

## Maintenance

- **Bumping the template**: point `TEMPLATE_SRC` at the updated template
  checkout, run `pnpm sync-template`, verify the build, commit.
- **Bumping content manually**: `git submodule update --remote content && git add content && git commit` —
  normally handled automatically by the deploy workflow on a `vault-sync` dispatch.
- **Yearly template replacement**: see the "Replacing the template" runbook
  in [ARCHITECTURE.md](./ARCHITECTURE.md).
- **Content contract**: schema and content conventions are documented in
  the template repo's `CONTENT_CONTRACT.md` and mirrored in the content
  repo — read that before changing frontmatter shape.
