#!/bin/bash

set -e

TEMPLATE_REPO="${TEMPLATE_REPO}"
TEMPLATE_BRANCH="${TEMPLATE_BRANCH:-main}"

TMP_DIR="$(mktemp -d)"

git clone \
  --depth 1 \
  --branch "$TEMPLATE_BRANCH" \
  "$TEMPLATE_REPO" \
  "$TMP_DIR"

rsync -av --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "dist" \
  --exclude "src/content" \
  "$TMP_DIR/" \
  template/

rm -rf template/src/content
ln -s ../../content template/src/content

rm -rf "$TMP_DIR"

if [[ ! -L "template/src/content" ]]; then
  echo "✗ content symlink was not created at template/src/content" >&2
  exit 1
fi

if [[ ! -e "template/src/content/site/config.yaml" ]]; then
  echo "✗ content symlink is broken, or content repo is missing site/config.yaml — check that 'template/src/content' resolves to a real content checkout" >&2
  exit 1
fi

echo "✓ Template synced"