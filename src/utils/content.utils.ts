import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

const isDev = import.meta.env.DEV;

// ── Draft filter ───────────────────────────────────────────────────────────────

function isDraftVisible(draft: boolean): boolean {
  return isDev || !draft;
}

// ── Collection queries ─────────────────────────────────────────────────────────

/**
 * All published posts sorted by date descending.
 * Drafts visible in dev, excluded in prod.
 */
export async function getPublishedPosts(): Promise<CollectionEntry<"posts">[]> {
  const posts = await getCollection("posts", ({ data }) =>
    isDraftVisible(data.draft)
  );
  return posts.sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
  );
}

/**
 * Single post by id.
 * Returns undefined if not found or draft in prod.
 */
export async function getPost(
  id: string
): Promise<CollectionEntry<"posts"> | undefined> {
  const posts = await getCollection("posts", ({ data }) =>
    isDraftVisible(data.draft)
  );
  return posts.find((p) => p.id === id);
}

/**
 * All published pages.
 * Drafts visible in dev, excluded in prod.
 */
export async function getPublishedPages(): Promise<CollectionEntry<"pages">[]> {
  return getCollection("pages", ({ data }) => isDraftVisible(data.draft));
}

// ── Derived queries ────────────────────────────────────────────────────────────

/**
 * Posts grouped by publication year, descending.
 */
export async function getPostsByYear(): Promise<
  Map<number, CollectionEntry<"posts">[]>
> {
  const posts = await getPublishedPosts();
  return groupByYear(posts);
}

/**
 * Posts for a given tag, sorted by date descending.
 */
export async function getPostsByTag(
  tag: string
): Promise<CollectionEntry<"posts">[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.tags?.includes(tag));
}

/**
 * All unique tags with post counts.
 */
export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  const tags = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }

  return new Map([...tags.entries()].sort((a, b) => b[1] - a[1]));
}

/**
 * Posts in a series, sorted by order ascending.
 */
export async function getSeriesPosts(
  series: string
): Promise<CollectionEntry<"posts">[]> {
  const posts = await getPublishedPosts();
  return posts
    .filter((p) => p.data.series === series)
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

/**
 * Related posts for a given post — scored by category + tag overlap.
 * Falls back to recent posts if not enough matches found.
 *
 * Scoring:
 *   same category + shared tag → 3
 *   same category only         → 2
 *   shared tag only            → 1
 *
 * Posts sorted by score desc, then date desc within each score tier.
 */
export function getRelatedPosts(
  current: CollectionEntry<"posts">,
  allPosts: CollectionEntry<"posts">[],
  count: number
): CollectionEntry<"posts">[] {
  const currentTags     = current.data.tags     ?? [];
  const currentCategory = current.data.category;
 
  const scored = allPosts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sameCategory = currentCategory && post.data.category === currentCategory;
      const sharedTag    = (post.data.tags ?? []).some((tag) => currentTags.includes(tag));
 
      let score = 0;
      if (sameCategory && sharedTag) score = 3;
      else if (sameCategory)         score = 2;
      else if (sharedTag)            score = 1;
 
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      b.post.data.published.valueOf() - a.post.data.published.valueOf()
    )
    .slice(0, count)
    .map(({ post }) => post);
 
  // Fallback to recent posts if not enough scored matches
  if (scored.length < count) {
    const recent = allPosts
      .filter(
        (post) =>
          post.id !== current.id &&
          !scored.find((r) => r.id === post.id)
      )
      .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf())
      .slice(0, count - scored.length);
 
    return [...scored, ...recent];
  }
 
  return scored;
}

// ── Pure utilities ─────────────────────────────────────────────────────────────

/**
 * Group posts by publication year, descending.
 */
export function groupByYear(
  posts: CollectionEntry<"posts">[]
): Map<number, CollectionEntry<"posts">[]> {
  const groups = new Map<number, CollectionEntry<"posts">[]>();

  for (const post of posts) {
    const year = new Date(post.data.published).getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(post);
  }

  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]));
}

/**
 * Calculate reading time from markdown content.
 * @param content - Raw markdown string
 * @param wordsPerMinute - Reading speed (default 200). Adjust for non-English content,
 *   e.g. 150 for Marathi or other Indic scripts.
 */
export interface ReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

export function calculateReadingTime(
  content: string,
  wordsPerMinute = 200
): ReadingTime {
  if (!content || typeof content !== "string") {
    return { text: "1 min read", minutes: 1, time: 60000, words: 0 };
  }

  const plainText = content
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "$1")
    .replace(/`{1,3}.*?`{1,3}/gs, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return {
    text: `${minutes} min read`,
    minutes,
    time: minutes * 60 * 1000,
    words: wordCount,
  };
}