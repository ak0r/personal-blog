import { visit } from 'unist-util-visit';
import type { Root, Text, Link, Image } from 'mdast';

/**
 * Remark Obsidian Core Plugin
 *
 * Handles Obsidian-specific markdown in one pass:
 * - Wikilinks [[Page]] and [[Page|Alias]] → /posts/slug
 * - Image embeds ![[image.jpg]] → standard image nodes
 * - Comments %%...%% → removed
 * - Highlights ==text== → <mark>text</mark>
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function processCommentsAndHighlights(text: string): string {
  // Remove Obsidian comments
  text = text.replace(/%%.*?%%/gs, '');
  // Convert highlights to mark elements
  text = text.replace(/==(.*?)==/g, '<mark>$1</mark>');
  return text;
}

export function remarkObsidianCore() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const { value } = node;
      const newNodes: any[] = [];
      let lastIndex = 0;

      // Image embeds: ![[image.jpg]] or ![[image.jpg|alt text]]
      const imageEmbedRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      // Wikilinks: [[Page]] or [[Page|Alias]]
      const wikilinkRegex = /(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

      // Collect image embed matches
      const imageMatches: Array<{
        start: number;
        end: number;
        node: Image;
      }> = [];

      let match: RegExpExecArray | null;

      while ((match = imageEmbedRegex.exec(value)) !== null) {
        const imagePath = match[1].trim();
        const altText = match[2]?.trim() || imagePath;

        imageMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          node: {
            type: 'image',
            url: imagePath,
            alt: altText,
          } as Image,
        });
      }

      // Collect wikilink matches
      const wikilinkMatches: Array<{
        start: number;
        end: number;
        node: Link;
      }> = [];

      wikilinkRegex.lastIndex = 0;

      while ((match = wikilinkRegex.exec(value)) !== null) {
        // Skip if overlaps with image embed
        const overlaps = imageMatches.some(
          (img) => match!.index >= img.start && match!.index < img.end
        );
        if (overlaps) continue;

        const targetPage = match[1].trim();
        const linkText = match[2]?.trim() || targetPage;

        let url: string;

        if (targetPage.startsWith('#')) {
          // Same-page anchor
          url = `#${slugify(targetPage.slice(1))}`;
        } else if (targetPage.includes('#')) {
          // Cross-page anchor
          const [page, anchor] = targetPage.split('#');
          url = `/posts/${slugify(page)}#${slugify(anchor)}`;
        } else {
          // Standard post link
          url = `/posts/${slugify(targetPage)}`;
        }

        wikilinkMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          node: {
            type: 'link',
            url,
            children: [{ type: 'text', value: linkText }],
          } as Link,
        });
      }

      // Combine and sort all matches by position
      const allMatches = [
        ...imageMatches.map((m) => ({ ...m, kind: 'image' as const })),
        ...wikilinkMatches.map((m) => ({ ...m, kind: 'link' as const })),
      ].sort((a, b) => a.start - b.start);

      if (allMatches.length === 0) {
        // No wikilinks or embeds — still process comments and highlights
        const processed = processCommentsAndHighlights(value);
        if (processed !== value) {
          node.value = processed;
        }
        return;
      }

      // Build replacement node array
      for (const m of allMatches) {
        if (m.start > lastIndex) {
          const textBefore = processCommentsAndHighlights(
            value.slice(lastIndex, m.start)
          );
          if (textBefore) {
            newNodes.push({ type: 'text', value: textBefore });
          }
        }
        newNodes.push(m.node);
        lastIndex = m.end;
      }

      if (lastIndex < value.length) {
        const textAfter = processCommentsAndHighlights(value.slice(lastIndex));
        if (textAfter) {
          newNodes.push({ type: 'text', value: textAfter });
        }
      }

      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes);
        return index + newNodes.length;
      }
    });
  };
}

export default remarkObsidianCore;