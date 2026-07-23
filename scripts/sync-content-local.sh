#!/bin/bash
# sync-content-local.sh

set -e

VAULT="${BLOG_VAULT:-/mnt/d/my-data/notes/personal-blog-content}"
CONTENT="content"

DRY_RUN=""

if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "⚠ Dry run — no files will be changed"
fi

git submodule update --init "$CONTENT"

COLLECTIONS=("posts" "pages" "site" "notes")

for collection in "${COLLECTIONS[@]}"; do
  rsync -av --delete $DRY_RUN \
    "$VAULT/$collection/" \
    "$CONTENT/$collection/"
done

echo "✓ Content synced from $VAULT"