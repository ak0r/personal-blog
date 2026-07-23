/**
 * Sätteri plugins for inline body images.
 *
 * resolveVaultImagePaths — normalizes Obsidian vault-absolute image paths
 *   (mdast, runs before Astro's built-in image collector).
 * imageAttributes        — lazy loading + title-as-caption (hast).
 * galleryGrouping         — merges consecutive image-only paragraphs into a
 *   `.gallery-single`/`.gallery-grid` div of `.gallery-item` images (hast),
 *   for GalleryLightbox to attach to.
 */

import { fileURLToPath } from 'node:url';
import { posix as pathPosix } from 'node:path';
import type { Element, ElementContent, Text as HastText } from 'hast';

// ── MDAST plugin: normalize vault-absolute image paths ───────────────────────
// Handles both flat collections (src/content/posts/*.md + a shared
// posts/attachments/) and nested, one-directory-per-entry posts
// (src/content/posts/_travels/.../<slug>/attachments/) by resolving the
// vault-absolute URL relative to the current file's own directory.
function resolveVaultImageUrl(url: string, fileURL: URL | undefined): string {
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return url;

  // Bare filename — no path separators.
  if (!url.includes('/')) return `./attachments/${url}`;

  if (url.startsWith('attachments/') || url.startsWith('images/')) return `./${url}`;

  if (fileURL) {
    const filePath = fileURLToPath(fileURL).replace(/\\/g, '/');
    const contentIndex = filePath.indexOf('/src/content/');
    if (contentIndex !== -1) {
      const relFromContentRoot = filePath.slice(contentIndex + '/src/content/'.length);
      const collection = relFromContentRoot.split('/')[0];
      if (url.startsWith(`${collection}/`)) {
        const fileDir = pathPosix.dirname(relFromContentRoot);
        const relative = pathPosix.relative(fileDir, url);
        return relative.startsWith('.') ? relative : `./${relative}`;
      }
    }
  }

  return `./${url}`;
}

export const resolveVaultImagePaths = {
  name: 'resolve-vault-image-paths',
  image(node: any, ctx: any) {
    if (!node.url) return;
    const resolved = resolveVaultImageUrl(node.url, ctx.fileURL);
    if (resolved !== node.url) ctx.setProperty(node, 'url', resolved);
  },
};

// ── HAST plugin: lazy loading + caption ──────────────────────────────────────
export const imageAttributes = {
  name: 'image-attributes',
  element: {
    filter: ['img'],
    visit(node: Element, ctx: any) {
      const props = node.properties ?? {};
      if (!props.loading) ctx.setProperty(node, 'loading', 'lazy');
      if (!props.decoding) ctx.setProperty(node, 'decoding', 'async');
      if (props.title && !props['data-caption']) ctx.setProperty(node, 'data-caption', props.title);
    },
  },
};

// ── HAST plugin: gallery grouping ────────────────────────────────────────────
function isImageOnlyParagraph(node: Element): boolean {
  if (!node.children.length) return false;
  return node.children.every(
    (child) =>
      (child.type === 'element' && child.tagName === 'img') ||
      (child.type === 'text' && (child as HastText).value.trim() === '')
  );
}

function collectImages(node: Element): Element[] {
  return node.children.filter(
    (child): child is Element => child.type === 'element' && child.tagName === 'img'
  );
}

function galleryItem(img: Element): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: { class: 'gallery-item' },
    children: [{ ...img, properties: { ...img.properties, class: 'gallery-item__image' } }],
  };
}

function galleryDiv(images: Element[]): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: { class: images.length === 1 ? 'gallery-single' : 'gallery-grid' },
    children: images.map(galleryItem) as ElementContent[],
  };
}

// A factory (not a shared object) so the consumed-index bookkeeping resets
// per document — Sätteri dispatches every matched `p` from a single upfront
// scan, so a later sibling already folded into an earlier group's div still
// gets its own visit() call and must be told to no-op.
export function galleryGrouping() {
  const consumedIndices = new WeakMap<object, Set<number>>();

  return {
    name: 'gallery-grouping',
    element: {
      filter: ['p'],
      visit(node: Element, ctx: any) {
        const parent = ctx.parent(node);
        const index = ctx.indexOf(node);
        if (!parent || index === undefined) return;

        const consumed = consumedIndices.get(parent);
        if (consumed?.has(index)) return;
        if (!isImageOnlyParagraph(node)) return;

        const group = [index];
        let i = index + 1;
        while (i < parent.children.length) {
          const sibling = parent.children[i];
          if (sibling.type === 'text' && sibling.value.trim() === '') {
            i++;
            continue;
          }
          if (sibling.type === 'element' && sibling.tagName === 'p' && isImageOnlyParagraph(sibling)) {
            group.push(i);
            i++;
            continue;
          }
          break;
        }

        const set = consumed ?? new Set<number>();
        for (const idx of group) set.add(idx);
        consumedIndices.set(parent, set);

        const images = group.flatMap((idx) => collectImages(parent.children[idx] as Element));
        for (const idx of group.slice(1)) ctx.removeNode(parent.children[idx]);

        return galleryDiv(images);
      },
    },
  };
}
