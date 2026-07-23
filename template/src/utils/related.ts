import type { Post, Note } from "@/types";

const SAME_CATEGORY_SCORE = 2;
const SHARED_TAG_SCORE = 1;

export function getRelatedEntries(
  entry: Post | Note,
  pool: (Post | Note)[],
  limit = 3,
): (Post | Note)[] {
  const category = entry.data.category;
  const tags = new Set(entry.data.tags ?? []);

  return pool
    .filter((candidate) => !(candidate.collection === entry.collection && candidate.id === entry.id))
    .map((candidate) => {
      const sameCategory = category && candidate.data.category === category ? SAME_CATEGORY_SCORE : 0;
      const sharedTags = (candidate.data.tags ?? []).filter((tag) => tags.has(tag)).length * SHARED_TAG_SCORE;
      return { candidate, score: sameCategory + sharedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.data.published.valueOf() - a.candidate.data.published.valueOf())
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
