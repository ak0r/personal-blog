# Architecture

Three repositories, split by how often each one actually changes:

| Repo | Owns | Change cadence |
|---|---|---|
| **astrordinary** (template) | Astro app: components, layouts, styles, `astro.config.mjs`, `src/content.config.ts` (schema) | monthly fixes, yearly full replacement |
| **personal-blog-content** (content) | Markdown, images, media, `site/config.yaml` | near-daily |
| **personal-blog** (this repo) | Sync scripts, GitHub workflows, Cloudflare deploy | rarely |

Primary design goal: **replace the template without migrating content.**

## Ownership

- **Template is independently deployable.** Someone can clone
  `astrordinary` alone and run `pnpm install && pnpm build` — it ships its
  own default content so the build never depends on this repo or the
  content repo existing. This is why Astro-specific files (`astro.config.*`,
  `src/content.config.ts`, the Zod schemas) live in the template, not
  here or in content — Astro requires them at the project root to build at
  all.
- **Content owns only content.** No `package.json`, no scripts, no build
  tooling — ever. That constraint is what keeps content portable across a
  template swap; the day content acquires its own tooling, it stops being
  swap-safe.
- **Personal-blog is not a source of truth for anything.** It orchestrates
  and deploys. `template/` is a sync target — generated, overwritten on
  every sync, never hand-edited; edits there are silently discarded by
  the next sync. `content/` is a git submodule pointing at
  `personal-blog-content` — editing files inside it locally just makes
  the submodule dirty (fine for previewing vault changes before they're
  published), but personal-blog only ever tracks *which commit* of
  content it's pinned to, never content's file contents directly. Either
  way, the real source is the corresponding repo, not this one.

## The content contract

The template's schema (`src/content.config.ts`) is the enforced contract;
`CONTENT_CONTRACT.md` (mirrored in both the template and content repos) is
the human-readable version of the same contract — field names, required
vs. optional, file-layout rules, known gotchas. If the two ever disagree,
the code wins and the doc gets fixed to match.

**Compatibility is the default.** Monthly template fixes must stay
compatible with existing content — additive/optional schema changes only.
Breaking content changes are reserved for an intentional yearly template
migration, where the maintainer is already expected to touch content
adjacent to the swap.

## Sync flow

Template and content are synced through two different mechanisms —
intentionally, they're not the same problem:

**Template** — no git relationship between personal-blog and
`astrordinary`; it's mirrored by file copy. **Local**
(`scripts/sync-template-local.sh`) `rsync -av --delete`s from a sibling
checkout on disk (`$TEMPLATE_SRC`), for fast iteration. **CI**
(`scripts/sync-template-ci.sh`) shallow `git clone`s the published repo
into a temp dir and `rsync -av --delete`s into `template/`. Both are
idempotent — `rsync --delete` converges to the source's exact state
regardless of how many times it runs.

**Content** — `content/` is a genuine git submodule (`.gitmodules`)
pointing at `personal-blog-content`, not a copy. **Local**
(`scripts/sync-content-local.sh`) runs `git submodule update --init`
(so a fresh clone just works) and then overlays the local Obsidian vault
(`$BLOG_VAULT`) on top via `rsync -av --delete`, for previewing unpublished
vault edits — this leaves the submodule locally dirty, which is expected
and never committed from here. **CI** runs
`git submodule update --remote content`, which bumps the pointer to the
latest commit on content's tracked branch — no file copying at all.

After sync, `template/src/content` is a symlink to `../../content`
(created by the template sync scripts). Both template sync scripts fail
loudly (non-zero exit) if the symlink wasn't created or resolves to a
missing `site/config.yaml`, instead of silently producing an empty build.

## Deployment flow

```
content push  ─┐
               ├─▶ repository_dispatch (vault-sync / template-sync)
template push ─┘         │
                          ▼
              fetch-content.yml (this repo)
                 1. update content submodule pointer (git submodule update --remote)
                 2. sync template (scripts/sync-template-ci.sh)
                 3. commit + push if changed
                          │
                          ▼
              Cloudflare Pages builds from personal-blog's main branch
```

**Known gap, being closed incrementally:** `fetch-content.yml` now accepts
both `vault-sync` and `template-sync` dispatch types, but the *sending*
side only exists in the content repo today. The template repo (`astrordinary`)
needs its own CI step to fire the `template-sync` dispatch on push to
`main`, e.g.:

```yaml
- name: Notify personal-blog
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.PERSONAL_BLOG_DISPATCH_TOKEN }}" \
      -H "Accept: application/vnd.github+json" \
      https://api.github.com/repos/<owner>/personal-blog/dispatches \
      -d '{"event_type":"template-sync"}'
```

Until that's added to `astrordinary`, monthly template fixes require a
manual dispatch to redeploy.

## Rationale

**Why three repos, not one.** Change cadence differs by roughly two orders
of magnitude between content (daily) and template (monthly-to-yearly).
Collapsing them would recouple things whose lifecycles are genuinely
independent.

**Why schema lives in the template, not content.** Astro's content
collections require `content.config.ts` at the project root to build at
all — the content repo has no JS toolchain to host it even if we wanted
to. This isn't a workaround, it's a framework constraint, and it's why
template-standalone-buildability was made an explicit requirement rather
than an accident.

**Why template is a file copy but content is a submodule.** Both started
as full-copy vendoring, committed into personal-blog on every sync — at
content's near-daily cadence that meant a full-tree commit almost every
day, growing this repo's history indefinitely for no benefit. A submodule
fixes that for content: personal-blog now only ever commits a ~40-byte
pointer to a specific content commit, never the files themselves. Template
stays a plain file copy — at monthly-to-yearly cadence its contribution to
history growth is much smaller, and a plain copy keeps template
resolution simple (no git-in-git behavior to reason about) for the one
directory that genuinely needs to be a self-contained, buildable tree on
disk for the symlink trick to work.

**Why the CI workflow still commits (a smaller amount) into this repo's
history.** Cloudflare Pages is configured to build from a git push to
personal-blog's `main` branch (dashboard-level integration, not
repo-tracked config) — there's no deploy-hook wiring, so a commit is
still the trigger mechanism. Content no longer contributes meaningful
weight to that commit; template still does. This was an explicit choice
to keep the pipeline boring over adopting a deploy-hook/`wrangler`-based
trigger — see "Risks being monitored" below.

## Risks being monitored (not solved)

- **Template-side git history growth in this repo.** Every template sync
  that changes anything still results in a commit here carrying a full
  copy of the template tree. At monthly-to-yearly cadence this grows much
  more slowly than the old content-side growth did (now eliminated by the
  submodule). No fix applied — no proven pain yet. Revisit only if it
  becomes measurably worse.
- **Cloudflare build configuration lives outside this repo**, set via
  dashboard rather than a tracked config file (no `wrangler.toml` present).
  Opaque to a future reader of just the git history. Not fixed now;
  flagged so it isn't mistaken for an oversight.

## Runbook: replacing the template (yearly)

1. Clone/prepare the new template checkout, point `TEMPLATE_SRC` at it.
2. `pnpm sync-template` (or `pnpm sync-dry` first to preview).
3. `pnpm build` locally — confirm it succeeds and the symlink guard passes.
4. Smoke-check key pages (home, a post, a note, tag/browse pages) against
   the new template's rendering.
5. Update `site` in the new template's `astro.config.mjs` to the real
   domain if not already set.
6. Reconcile `CONTENT_CONTRACT.md` — the new template's schema may accept
   different/additional fields; update existing content only if the new
   template requires it (this is the one point where breaking content
   changes are expected).
7. Commit, push, let the normal deploy flow take over.

## Runbook: build produced an empty or broken site

1. Check the sync step's output — the template sync scripts now fail
   loudly if `template/src/content` isn't a valid symlink or
   `site/config.yaml` is missing through it.
2. If sync succeeded but content still looks wrong, check the submodule
   pointer — `git submodule status content` shows what commit it's
   pinned to. Locally, a bad `$BLOG_VAULT` path fails
   `sync-content-local.sh` loudly (`set -e`) rather than silently
   producing an empty sync.
3. If both syncs succeeded, the problem is in the template or content
   itself, not the orchestration — bisect from there.
