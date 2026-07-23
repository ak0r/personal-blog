import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;
export type Note = CollectionEntry<"notes">;
export type Page = CollectionEntry<"pages">;

export type SocialIcon =
  | "github"
  | "mastodon"
  | "twitter"
  | "rss"
  | "email"
  | "instagram"
  | "youtube";

export interface NavItem {
  title: string;
  url: string;
}

export interface SocialItem {
  title: string;
  url: string;
  icon?: SocialIcon;
}

/* -------------------------------------------------------------------------- */
/* Browse */
/* -------------------------------------------------------------------------- */

export interface BrowseDimension {
  /**
   * Data source.
   *
   * Built-in:
   *   published
   *   category
   *   tags
   *
   * Otherwise resolves to:
   *   entry.data.meta[key]
   */
  key: string;

  /** Display title. */
  title: string;

  /** URL segment. */
  slug: string;

  sort?: "asc" | "desc";
}

export interface BrowseConfig {
  dimensions?: BrowseDimension[];
}

/* -------------------------------------------------------------------------- */

export interface UserConfig {
  // site identity
  title: string;
  description: string;
  url: string;
  locale?: string;

  // author
  author: {
    name: string;
    bio?: string;
    url?: string;
    avatar?: string;
  };

  // assets
  logo?: string;
  ogImage?: string;

  // navigation
  navigation?: NavItem[];
  footerLinks?: NavItem[];
  social?: SocialItem[];

  // content display
  heroText?: string;
  notebookQuote?: string;
  tagline?: string;
  footerCredits?: string;
  postsPerPage?: number;
  recentPosts?: number;

  // flags
  showLogo?: boolean;

  // browse
  browse?: BrowseConfig;
}