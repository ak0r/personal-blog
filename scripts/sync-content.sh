#!/bin/bash
set -e

VAULT="${BLOG_VAULT:-/mnt/d/my-data/notes/personal-blog-content}"
CONTENT="template/src/content"

DRY_RUN=""
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "⚠ Dry run — no files will be changed"
fi

rsync -av --delete \
  --exclude=".obsidian/" \
  --exclude="*.canvas" \
  --exclude=".trash/" \
  $DRY_RUN "$VAULT/" "$CONTENT/"

echo "✓ Content synced from $VAULT"