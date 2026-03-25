/**
 * src/pages/og/[page].png.ts
 *
 * Static OG images for non-post pages.
 * Output: /og/default.png, /og/posts.png, /og/tags.png, /og/about.png, /og/search.png
 *
 * Simpler layout than post images — centered title + description,
 * left accent border, site name bottom-right.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { ImageResponse } from '@vercel/og';
import { siteConfig } from '@/site.config';

const C = {
  bg:      '#faf9f5',
  title:   '#141413',
  body:    '#5e5d59',
  subtle:  '#87867f',
  divider: '#d1cfc5',
  accent:  '#788c5d',
} as const;

const PAGE_DATA: Record<string, { title: string; description: string }> = {
  default: {
    title:       siteConfig.title,
    description: siteConfig.description,
  },
  posts: {
    title:       'Articles',
    description: 'Travel stories and tech writing',
  },
  tags: {
    title:       'Tags',
    description: 'Browse posts by topic',
  },
  about: {
    title:       'About',
    description: `${siteConfig.author} — ${siteConfig.description}`,
  },
  search: {
    title:       'Search',
    description: `Search all posts on ${siteConfig.title}`,
  },
};

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url}`);
  return res.arrayBuffer();
}

export const getStaticPaths: GetStaticPaths = async () =>
  Object.keys(PAGE_DATA).map((page) => ({
    params: { page },
    props:  PAGE_DATA[page],
  }));

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description: string };

  const [fontRegular, fontSemiBold] = await Promise.all([
    loadFont('https://api.fontsource.org/v1/fonts/rubik/latin-400-normal.ttf'),
    loadFont('https://api.fontsource.org/v1/fonts/rubik/latin-600-normal.ttf'),
  ]);

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

        // Left accent border
        {
          type: 'div',
          props: {
            style: {
              width:      '12px',
              height:     '100%',
              background: C.accent,
              flexShrink: 0,
            },
          },
        },

        // Content
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

              // Title + description
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '0px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize:   '80px',
                          fontWeight: 600,
                          color:      C.title,
                          lineHeight: 1.1,
                          display:    'flex',
                        },
                        children: title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize:   '30px',
                          fontWeight: 400,
                          color:      C.body,
                          lineHeight: 1.5,
                          marginTop:  '20px',
                          display:    'flex',
                        },
                        children: description,
                      },
                    },
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
                    // Author + site name row
                    {
                      type: 'div',
                      props: {
                        style: {
                          display:        'flex',
                          justifyContent: 'space-between',
                          alignItems:     'center',
                        },
                        children: [
                          // Author + date
                          {
                            type: 'div',
                            props: {
                              style: {
                                display:       'flex',
                                flexDirection: 'row',
                                alignItems:    'center',
                                gap:           '12px',
                              },
                              children: [
                                // Avatar circle
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      width:           '44px',
                                      height:          '44px',
                                      borderRadius:    '50%',
                                      background:      C.accent,
                                      display:         'flex',
                                      alignItems:      'center',
                                      justifyContent:  'center',
                                      color:           '#ffffff',
                                      fontSize:        '20px',
                                      fontWeight:      600,
                                      flexShrink:      0,
                                    },
                                    children: siteConfig.author.charAt(0).toUpperCase(),
                                  },
                                },
                                // Author name + date
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      fontSize:   '20px',
                                      fontWeight: 600,
                                      color:      C.title,
                                      display:    'flex',
                                    },
                                    children: siteConfig.author,
                                  },
                                },
                              ],
                            },
                          },
                          // Site name
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize:   '22px',
                                fontWeight: 600,
                                color:      C.accent,
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