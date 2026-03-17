/**
 * String Utilities
 *
 * Centralized string transformation operations.
 */

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