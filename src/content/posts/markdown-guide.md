---
title: "Typography & Markdown Guide"
description: "A live reference of all typographic elements rendered by this template."
published: 2026-02-24
tags:
  - markdown
  - muul
series: Getting Started with Muul
order: 2
---

This post exists to show what the template does with words. Every element below is rendered from plain markdown — no HTML, no custom components. If something looks wrong, fix the CSS, not the content.

## Headings

# Heading One
## Heading Two
### Heading Three
#### Heading Four
##### Heading Five
###### Heading Six

---

## Body text

Regular paragraph text should be comfortable to read at length. The line length is capped, the line height gives room to breathe, and the serif keeps things grounded. **Bold is used for emphasis**, *italic for tone or titles*, and ***bold italic*** when both are needed. ~~Strikethrough~~ is available but rarely the right call.

A second paragraph. Spacing between paragraphs matters as much as the text itself. Too tight and reading feels rushed. Too loose and the piece loses cohesion.

---

## Links

An [inline link](https://astro.build) looks like this. External links should get the ↗ indicator automatically. An [internal link](/posts) should not.

---

## Blockquote

> The best writing is rewriting.
>
> — E.B. White

---

## Inline code and code blocks

Use `backticks` for inline code references like `npm install` or variable names like `siteConfig`.

A fenced block with syntax:

```typescript
interface SiteConfig {
  url: string;
  title: string;
  author: string;
  recentPosts: number;
}

export const siteConfig: SiteConfig = {
  url: "https://muul.amitkul.in",
  title: "Muul",
  author: "Amit K",
  recentPosts: 8,
};
```

A plain block without a language:

```
This has no syntax highlighting.
It renders in monospace all the same.
```

---

## Lists

Unordered:

- First item
- Second item
  - Nested under second
  - Another nested item
- Third item

Ordered:

1. Start here
2. Then here
3. End here
   1. Nested numbered
   2. Another

---

## Table

| Element     | Tag         | Use case                          |
|-------------|-------------|-----------------------------------|
| Heading 1   | `<h1>`      | Page title, once per post         |
| Paragraph   | `<p>`       | Body text                         |
| Blockquote  | `<blockquote>` | Pull quotes, citations          |
| Code block  | `<pre><code>` | Multi-line code samples         |
| Inline code | `<code>`    | Variable names, commands          |

---

## Horizontal rule

Three dashes create a thematic break:

---

## Footnotes

Writing often benefits from a footnote[^1] rather than a long parenthetical that interrupts the flow of the sentence.

[^1]: This is the footnote. It lives at the bottom, linked back to its reference.

---

## Small and muted text

HTML is valid inside markdown when needed:

<small>This is small text — useful for captions, credits, or legal boilerplate.</small>

---

## What's not here

Math (LaTeX), diagrams (Mermaid), and callout blocks are specific extensions and are not part of this template's scope. If you need them, add the appropriate Astro integration.