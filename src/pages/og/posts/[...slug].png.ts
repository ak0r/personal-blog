/**
 * src/pages/og/posts/[...slug].png.ts
 *
 * Static OG image generation for all published posts.
 * Uses @vercel/og (ImageResponse / Satori) for full layout control.
 * Output: /og/posts/{post-id}.png
 *
 * Design: light slate-050 background, left category color border,
 * category label top-left, large title, description, horizontal rule,
 * author + site name bottom row.
 *
 * Border + accent colors per category:
 *   travel → clay  #d97757  [120, 140,  93]
 *   tech   → sky    #6a9bcc  [106, 155, 204]
 *   default → accent #3AA99F
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { ImageResponse } from '@vercel/og';
import { getPublishedPosts } from '@/utils/content.utils';
import { siteConfig } from '@/site.config';

// ── Palette ───────────────────────────────────────────────────────────────────

const C = {
  bg:       '#faf9f5',   // slate-050
  bgAlt:    '#f5f4ed',   // slate-100
  title:    '#141413',   // slate-950
  body:     '#5e5d59',   // slate-600
  subtle:   '#87867f',   // slate-500
  divider:  '#d1cfc5',   // slate-300
  accent:   '#3AA99F',
  clay:    '#d97757',
  sky:      '#6a9bcc',
} as const;

function categoryColor(category?: string): string {
  if (category === 'travel') return C.clay;
  if (category === 'tech')   return C.sky;
  return C.accent;
}

function categoryBadgeBg(category?: string): string {
  if (category === 'travel') return '#d97757';   // clay tint
  if (category === 'tech')   return '#6a9bcc';   // sky tint
  return '#788c5d';                               // accent tint
}

// ── Font loader ───────────────────────────────────────────────────────────────

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url}`);
  return res.arrayBuffer();
}

// ── Static paths ──────────────────────────────────────────────────────────────

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title:       post.data.title,
      description: post.data.description ?? '',
      category:    post.data.category,
      date:        post.data.published.toLocaleDateString('en-US', {
        year:  'numeric',
        month: 'short',
        day:   'numeric',
      }),
    },
  }));
};

// ── GET ───────────────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ props }) => {
  const { title, description, category, date } = props as {
    title:       string;
    description: string;
    category?:   'tech' | 'travel';
    date:        string;
  };

  const [fontRegular, fontSemiBold] = await Promise.all([
    loadFont('https://api.fontsource.org/v1/fonts/rubik/latin-400-normal.ttf'),
    loadFont('https://api.fontsource.org/v1/fonts/rubik/latin-600-normal.ttf'),
  ]);

  const accentColor  = categoryColor(category);
  const badgeBg      = categoryBadgeBg(category);
  const categoryLabel = category?.toUpperCase() ?? '';

  const truncatedDesc = description.length > 130
    ? description.slice(0, 130) + '…'
    : description;

  const html = {
    type: 'div',
    props: {
      style: {
        width:           '100%',
        height:          '100%',
        display:         'flex',
        flexDirection:   'row',
        background:      C.bg,
        fontFamily:      'Rubik, sans-serif',
      },
      children: [

        // Left color border
        {
          type: 'div',
          props: {
            style: {
              width:           '12px',
              height:          '100%',
              background:      accentColor,
              flexShrink:      0,
            },
          },
        },

        // Main content
        {
          type: 'div',
          props: {
            style: {
              flex:            1,
              display:         'flex',
              flexDirection:   'column',
              justifyContent:  'space-between',
              padding:         '64px 72px 56px 68px',
            },
            children: [

              // Top section — badge + title + description
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '0px' },
                  children: [

                    // Category badge row
                    ...(categoryLabel ? [{
                      type: 'div',
                      props: {
                        style: {
                          display:         'flex',
                          flexDirection:   'row',
                          alignItems:      'center',
                          gap:             '10px',
                          marginBottom:    '32px',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display:         'flex',
                                alignItems:      'center',
                                background:      badgeBg,
                                color:           title,
                                fontSize:        '18px',
                                fontWeight:      600,
                                padding:         '6px 16px',
                                borderRadius:    '999px',
                                letterSpacing:   '0.05em',
                              },
                              children: categoryLabel,
                            },
                          },
                        ],
                      },
                    }] : [{ type: 'div', props: { style: { marginBottom: '32px' } } }]),

                    // Title
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize:   title.length > 55 ? '52px' : '64px',
                          fontWeight: 600,
                          color:      C.title,
                          lineHeight: 1.15,
                          display:    'flex',
                        },
                        children: title,
                      },
                    },

                    // Description
                    ...(truncatedDesc ? [{
                      type: 'div',
                      props: {
                        style: {
                          fontSize:    '26px',
                          fontWeight:  400,
                          color:       C.body,
                          lineHeight:  1.5,
                          marginTop:   '20px',
                          display:     'flex',
                        },
                        children: truncatedDesc,
                      },
                    }] : []),
                  ],
                },
              },

              // Bottom section — divider + author row
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                  children: [

                    // Divider
                    {
                      type: 'div',
                      props: {
                        style: {
                          width:        '100%',
                          height:       '1px',
                          background:   C.divider,
                          display:      'flex',
                        },
                      },
                    },

                    // Author + site name row
                    {
                      type: 'div',
                      props: {
                        style: {
                          display:         'flex',
                          flexDirection:   'row',
                          justifyContent:  'space-between',
                          alignItems:      'center',
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
                                      background:      accentColor,
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
                                      display:       'flex',
                                      flexDirection: 'column',
                                      gap:           '2px',
                                    },
                                    children: [
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
                                      {
                                        type: 'div',
                                        props: {
                                          style: {
                                            fontSize:   '18px',
                                            fontWeight: 400,
                                            color:      C.subtle,
                                            display:    'flex',
                                          },
                                          children: date,
                                        },
                                      },
                                    ],
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
                                color:      accentColor,
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