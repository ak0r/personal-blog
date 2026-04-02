import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

const isDev = import.meta.env.DEV;

// ── Draft filter ───────────────────────────────────────────────────────────────

function isDraftVisible(draft: boolean): boolean {
  return isDev || !draft;
}

// ── Normalisation ──────────────────────────────────────────────────────────────

/**
 * Normalise a country name to a destination collection id.
 * Mirrors what Astro's glob loader does to filenames.
 *
 * "India"     → "india"
 * "Sri Lanka" → "sri-lanka"
 * "india"     → "india"
 */
export function toDestinationId(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Extract normalised destination ids from a post's countries field.
 *
 * Handles both resolved references { id } from reference() and raw
 * strings — safe during migration when some posts may still have
 * country names not yet resolved by Astro.
 */
export function getCountryIds(post: CollectionEntry<"posts">): string[] {
  const countries = post.data.countries;
  if (!countries?.length) return [];
  return countries.map((c: any) =>
    typeof c === "string" ? toDestinationId(c) : (c.id ?? toDestinationId(String(c)))
  );
}

// ── URL builder ────────────────────────────────────────────────────────────────

/**
 * Derive the canonical URL for a post.
 *
 * Travel posts: /travel/[slug]
 * Tech posts:   /tech/[slug]
 */
export function getPostUrl(post: CollectionEntry<"posts">): string {
  if (post.data.category === "tech") {
    return `/tech/${post.id}`;
  }
  return `/travel/${post.id}`;
}

// ── Post queries ───────────────────────────────────────────────────────────────

export async function getPublishedPosts(): Promise<CollectionEntry<"posts">[]> {
  const posts = await getCollection("posts", ({ data }) =>
    isDraftVisible(data.draft)
  );
  return posts.sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
  );
}

export async function getPost(
  id: string
): Promise<CollectionEntry<"posts"> | undefined> {
  const posts = await getCollection("posts", ({ data }) =>
    isDraftVisible(data.draft)
  );
  return posts.find((p) => p.id === id);
}

export async function getTravelPosts(): Promise<CollectionEntry<"posts">[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.category === "travel");
}

/**
 * Travel posts for a specific destination country.
 * countryId should be normalised e.g. 'india', 'sri-lanka'.
 */
export async function getTravelPostsByCountry(
  countryId: string
): Promise<CollectionEntry<"posts">[]> {
  const posts = await getTravelPosts();
  const normalised = toDestinationId(countryId); // normalise the incoming id too
  return posts.filter((p) => getCountryIds(p).includes(normalised));
}

export async function getTechPosts(): Promise<CollectionEntry<"posts">[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.category === "tech");
}

export async function getPublishedPages(): Promise<CollectionEntry<"pages">[]> {
  return getCollection("pages", ({ data }) => isDraftVisible(data.draft));
}

// ── Destination queries ────────────────────────────────────────────────────────

export async function getAllDestinations(): Promise<
  CollectionEntry<"destinations">[]
> {
  const destinations = await getCollection("destinations");
  return destinations.sort((a, b) =>
    a.data.title.localeCompare(b.data.title)
  );
}

/**
 * Aggregate places from posts per destination id.
 * A post with countries: [India, Japan] contributes places to both.
 */
export async function getPlacesByDestination(): Promise<Map<string, string[]>> {
  const posts = await getTravelPosts();
  const map = new Map<string, string[]>();

  for (const post of posts) {
    for (const id of getCountryIds(post)) {
      if (!map.has(id)) map.set(id, []);
      const existing = map.get(id)!;
      for (const place of post.data.places ?? []) {
        if (!existing.includes(place)) existing.push(place);
      }
    }
  }

  for (const [id, places] of map) {
    map.set(id, [...places].sort((a, b) => a.localeCompare(b)));
  }

  return map;
}

/**
 * Post count per destination id.
 * A post with countries: [India, Japan] counts once for each country.
 */
export async function getPostCountByDestination(): Promise<Map<string, number>> {
  const posts = await getTravelPosts();
  const map = new Map<string, number>();

  for (const post of posts) {
    for (const id of getCountryIds(post)) {
      map.set(id, (map.get(id) ?? 0) + 1);
    }
  }

  return map;
}

export async function getTravelTags(): Promise<Map<string, number>> {
  const posts = await getTravelPosts();
  return buildTagMap(posts);
}

export async function getTechTags(): Promise<Map<string, number>> {
  const posts = await getTechPosts();
  return buildTagMap(posts);
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getPublishedPosts();
  return buildTagMap(posts);
}

function buildTagMap(
  posts: CollectionEntry<"posts">[]
): Map<string, number> {
  const tags = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  return new Map([...tags.entries()].sort((a, b) => b[1] - a[1]));
}

// ── Derived queries ────────────────────────────────────────────────────────────

export async function getPostsByYear(): Promise<
  Map<number, CollectionEntry<"posts">[]>
> {
  const posts = await getPublishedPosts();
  return groupByYear(posts);
}

export async function getSeriesPosts(
  series: string
): Promise<CollectionEntry<"posts">[]> {
  const posts = await getPublishedPosts();
  return posts
    .filter((p) => p.data.series === series)
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

/**
 * Related posts — scored by countries + category + tag overlap.
 *
 * Scoring:
 *   shared country + shared tag → 4
 *   same category + shared tag  → 3
 *   same category only          → 2
 *   shared tag only             → 1
 */
export function getRelatedPosts(
  current: CollectionEntry<"posts">,
  allPosts: CollectionEntry<"posts">[],
  count: number
): CollectionEntry<"posts">[] {
  const currentTags      = current.data.tags ?? [];
  const currentCategory  = current.data.category;
  const currentCountries = getCountryIds(current);

  const scored = allPosts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sharedCountry =
        currentCountries.length > 0 &&
        getCountryIds(post).some((id) => currentCountries.includes(id));
      const sameCategory =
        currentCategory && post.data.category === currentCategory;
      const sharedTag = (post.data.tags ?? []).some((tag) =>
        currentTags.includes(tag)
      );

      let score = 0;
      if (sharedCountry && sharedTag)  score = 4;
      else if (sameCategory && sharedTag) score = 3;
      else if (sameCategory)           score = 2;
      else if (sharedTag)              score = 1;

      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.published.valueOf() - a.post.data.published.valueOf()
    )
    .slice(0, count)
    .map(({ post }) => post);

  if (scored.length < count) {
    const recent = allPosts
      .filter(
        (post) =>
          post.id !== current.id && !scored.find((r) => r.id === post.id)
      )
      .sort(
        (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
      )
      .slice(0, count - scored.length);

    return [...scored, ...recent];
  }

  return scored;
}

// ── Pure utilities ─────────────────────────────────────────────────────────────

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