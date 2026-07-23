#!/bin/bash
#sync-template-local.sh

set -e

TEMPLATE_SRC="${TEMPLATE_SRC:-$HOME/devhome/astrordinary}"
TEMPLATE_DEST="template"

DRY_RUN=""

if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "⚠ Dry run — no files will be changed"
fi

echo "→ Syncing template..."

rsync -av --delete $DRY_RUN \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "dist" \
  --exclude ".astro" \
  --exclude "public/pagefind" \
  --exclude "src/content" \
  "$TEMPLATE_SRC/" \
  "$TEMPLATE_DEST/"

if [[ -n "$DRY_RUN" ]]; then
  echo "✓ Dry run complete — content symlink left untouched"
  exit 0
fi

rm -rf "$TEMPLATE_DEST/src/content"
ln -s ../../content "$TEMPLATE_DEST/src/content"

if [[ ! -L "$TEMPLATE_DEST/src/content" ]]; then
  echo "✗ content symlink was not created at $TEMPLATE_DEST/src/content" >&2
  exit 1
fi

if [[ ! -e "$TEMPLATE_DEST/src/content/site/config.yaml" ]]; then
  echo "✗ content symlink is broken, or content repo is missing site/config.yaml — check that '$TEMPLATE_DEST/src/content' resolves to a real content checkout" >&2
  exit 1
fi

echo "✓ Template synced"