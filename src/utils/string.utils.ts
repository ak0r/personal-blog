/**
 * String Utilities
 *
 * Centralized string transformation operations.
 */

/**
 * Convert text to URL-friendly slug
 */
export function slugify(inputText?: string): string {
  if (!inputText) return '';

  return inputText
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Humanize a string (convert slugs/underscores to readable text)
 */
export function humanize(content: string): string {
  return content
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/[-\s]+/g, ' ')
    .replace(/^[a-z]/, (m) => m.toUpperCase());
}

/**
 * Title case a string (capitalize first letter of each word)
 */
export function titleify(content: string): string {
  const humanized = humanize(content);
  return humanized
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert slug to title (dashes to spaces, capitalize)
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncate(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length).trim() + suffix;
}

/**
 * Strip Obsidian wikilink brackets from a string
 */
export function stripObsidianBrackets(value: string): string {
  if (value.startsWith('[[') && value.endsWith(']]')) {
    return value.slice(2, -2);
  }
  return value;
}

/**
 * Add ordinal suffix to a day number.
 * e.g. 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", 11 → "11th"
 */
export function ordinalSuffix(day: number): string {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}
