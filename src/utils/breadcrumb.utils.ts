/**
 * Breadcrumb Utilities
 *
 * Shared crumb type and builder used by both Breadcrumb.astro
 * and SchemaOrg.astro so the same data drives both the visual
 * breadcrumb trail and the BreadcrumbList JSON-LD schema.
 */

export interface Crumb {
  title: string;
  href: string;
}

export function buildCrumbs(pathname: string, label?: string): Crumb[] {
  const crumbs: Crumb[] = [{ title: 'Home', href: '/' }];

  if (pathname === '/') return crumbs;

  // Strip pagination segments e.g. /posts/travel/2 → /posts/travel
  const cleanPath = pathname.replace(/\/\d+\/?$/, '');
  const segments = cleanPath.replace(/\/$/, '').split('/').filter(Boolean);

  if (segments[0] === 'posts') {
    crumbs.push({ title: 'Articles', href: '/posts' });

    if (segments[1]) {
      // Category page — generalised, stays in sync with post.schema.ts enum
      const CATEGORIES = ['travel', 'tech'];

      if (CATEGORIES.includes(segments[1])) {
        crumbs.push({
          title: segments[1].charAt(0).toUpperCase() + segments[1].slice(1),
          href:  `/posts/${segments[1]}`,
        });
      } else {
        // Individual post slug
        crumbs.push({
          title: label || segments[1].replace(/-/g, ' '),
          href:  pathname,
        });
      }
    }
  } else if (segments[0] === 'tags') {
    crumbs.push({ title: 'Tags', href: '/tags' });
    if (segments[1]) {
      crumbs.push({
        title: `#${segments[1]}`,
        href:  pathname,
      });
    }
  } else {
    crumbs.push({
      title: label || segments[0].replace(/-/g, ' '),
      href:  pathname,
    });
  }

  return crumbs;
}