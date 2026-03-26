/**
 * src/pages/og/[page].png.ts
 *
 * Static OG images for non-post pages using @vercel/og — same approach as
 * posts/[...slug].png.ts for consistency and Astro 6 compatibility.
 *
 * Output: /og/default.png, /og/posts.png, /og/tags.png, /og/about.png,
 *         /og/search.png, /og/posts-travel.png, /og/posts-tech.png
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { ImageResponse } from '@vercel/og';
import { siteConfig } from '@/site.config';

// ── Palette (matches [...slug].png.ts) ────────────────────────────────────────

const C = {
  bg:      '#faf9f5',
  bgAlt:   '#f5f4ed',
  title:   '#141413',
  body:    '#5e5d59',
  subtle:  '#87867f',
  divider: '#d1cfc5',
  accent:  '#3AA99F',
  clay:    '#d97757',
  sky:     '#6a9bcc',
} as const;

// ── Page definitions ──────────────────────────────────────────────────────────

const PAGES = {
  'default': {
    title:       siteConfig.title,
    description: siteConfig.description,
    border:      C.accent,
  },
  'posts': {
    title:       'Articles',
    description: 'Travel stories and tech writing',
    border:      C.accent,
  },
  'posts-travel': {
    title:       'Travel',
    description: 'Forts, temples, and roads less taken — travel writing from the Sahyadris, across India, and beyond.',
    border:      C.clay,
  },
  'posts-tech': {
    title:       'Tech',
    description: 'Notes on building things — self-hosted infrastructure, developer tooling, and systems that stay out of the way.',
    border:      C.sky,
  },
  'tags': {
    title:       'Tags',
    description: 'Browse posts by topic',
    border:      C.accent,
  },
  'about': {
    title:       'About',
    description: `${siteConfig.author} — ${siteConfig.description}`,
    border:      C.accent,
  },
  'search': {
    title:       'Search',
    description: `Search across all posts on ${siteConfig.title}`,
    border:      C.accent,
  },
} as const;

type PageKey = keyof typeof PAGES;

// ── Font loader ───────────────────────────────────────────────────────────────

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url}`);
  return res.arrayBuffer();
}

// ── Static paths ──────────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = () => {
  return (Object.keys(PAGES) as PageKey[]).map((page) => ({
    params: { page },
    props:  PAGES[page],
  }));
};

// ── GET ───────────────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ props }) => {
  const { title, description, border } = props as {
    title:       string;
    description: string;
    border:      string;
  };

  const [fontRegular, fontSemiBold] = await Promise.all([
    loadFont('https://api.fontsource.org/v1/fonts/rubik/latin-400-normal.ttf'),
    loadFont('https://api.fontsource.org/v1/fonts/rubik/latin-600-normal.ttf'),
  ]);

  const truncatedDesc = description.length > 130
    ? description.slice(0, 130) + '…'
    : description;

  const html = {
    type: 'div',
    props: {
      style: {
        width:         '100%',
        height:        '100%',
        display:       'flex',
        flexDirection: 'row',
        background:    C.bg,
        fontFamily:    'Rubik, sans-serif',
      },
      children: [

        // Left colour border
        {
          type: 'div',
          props: {
            style: {
              width:      '12px',
              height:     '100%',
              background: border,
              flexShrink: 0,
            },
          },
        },

        // Main content
        {
          type: 'div',
          props: {
            style: {
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              justifyContent: 'space-between',
              padding:        '64px 72px 56px 68px',
            },
            children: [

              // Top — title + description
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize:   title.length > 20 ? '72px' : '88px',
                          fontWeight: 600,
                          color:      C.title,
                          lineHeight: 1.15,
                          display:    'flex',
                        },
                        children: title,
                      },
                    },
                    ...(truncatedDesc ? [{
                      type: 'div',
                      props: {
                        style: {
                          fontSize:   '28px',
                          fontWeight: 400,
                          color:      C.body,
                          lineHeight: 1.5,
                          marginTop:  '24px',
                          display:    'flex',
                        },
                        children: truncatedDesc,
                      },
                    }] : []),
                  ],
                },
              },

              // Bottom — divider + site name
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width:      '100%',
                          height:     '1px',
                          background: C.divider,
                          display:    'flex',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display:        'flex',
                          flexDirection:  'row',
                          justifyContent: 'space-between',
                          alignItems:     'center',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize:   '22px',
                                fontWeight: 400,
                                color:      C.subtle,
                                display:    'flex',
                              },
                              children: siteConfig.author,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize:   '22px',
                                fontWeight: 600,
                                color:      border,
                                display:    'flex',
                              },
                              children: siteConfig.title,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

            ],
          },
        },
      ],
    },
  };

  return new ImageResponse(html as any, {
    width:  1200,
    height: 630,
    fonts: [
      { name: 'Rubik', data: fontRegular,  style: 'normal', weight: 400 },
      { name: 'Rubik', data: fontSemiBold, style: 'normal', weight: 600 },
    ],
  });
};