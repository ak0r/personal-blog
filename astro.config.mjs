// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import remarkCallouts from './src/utils/remark-callouts';
import { remarkObsidianCore } from './src/utils/remark-obsidian-core';
import { remarkImageProcessing } from './src/utils/remark-image-processing';

// https://astro.build/config
export default defineConfig({
  site: 'https://base.amitkul.in',

  image: {
    responsiveStyles: true,
    // layout: "constrained"
  },

  security: {
    contentSecurityPolicy: {
      directives: {
        // 'self' covers same-origin scripts including /pagefind/pagefind-ui.js
        // Astro auto-nonces is:inline scripts when CSP is enabled
        // Cloudflare Web Analytics beacon scrip
        "script-src": ["'self'", "https://static.cloudflareinsights.com"],
        // 'unsafe-inline' needed for Pagefind UI's dynamically injected result styles
        "style-src": ["'self'", "'unsafe-inline'"],
        // Pagefind fetches the search index via XHR
        // Cloudflare Analytics reports back to cloudflareinsights.com
        "connect-src": ["'self'", "https://cloudflareinsights.com"],
        // Pagefind uses a Web Worker for indexing
        "worker-src": ["'self'", "blob:"],
      },
    },
  },

  fonts: [
    {
      name: "Rubik",
      cssVariable: "--font-headings",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      fallbacks: ["sans-serif"],
    },
    {
      name: "Poppins",
      cssVariable: "--font-primary",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      fallbacks: ["sans-serif"],
    },
    {
      name: "Newsreader",
      cssVariable: "--font-secondary",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      fallbacks: ["serif"],
    },
    {
      name: "Fira Code",
      cssVariable: "--font-code",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      fallbacks: ["monospace"],
    },
  ],

  experimental: {
    contentIntellisense: true,
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
    },
  },

  integrations: [
    // Expressive Code must come before MDX
    expressiveCode({
      // Matches your data-theme attribute toggle
      themes: ['everforest-dark', 'everforest-light'],
      themeCssSelector: (theme) => 
        theme.name === 'everforest-dark' ? '[data-theme="dark"]' : '[data-theme="light"]',
    }),
    mdx(), 
    sitemap({
      serialize(item) {
        // Priority hints — higher for content, lower for utility pages
        if (item.url === 'https://base.amitkul.in/') {
          item.priority = 1.0;
        } else if (
          item.url.includes('/posts/travel') ||
          item.url.includes('/posts/tech')
        ) {
          item.priority = 0.8;
        } else if (item.url.includes('/posts/')) {
          item.priority = 0.7;
        } else if (item.url.includes('/tags/')) {
          item.priority = 0.5;
        } else if (
          item.url.includes('/search') ||
          item.url.includes('/404')
        ) {
          item.priority = 0.3;
        } else {
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [
      remarkObsidianCore,
      remarkImageProcessing,
      remarkCallouts,
    ],
  },

});