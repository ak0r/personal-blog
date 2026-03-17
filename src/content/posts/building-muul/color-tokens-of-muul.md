---
title: "Colour Tokens in Muul"
description: "The three-role, three-tone token model and how it keeps theming simple."
published: 2026-03-02
tags:
  - muul
  - css
  - design-system
series: "Building Muul"
order: 2
---

Most CSS variable systems for colour end up with names like `--gray-200`, `--blue-500`, or worse — `--primary`, `--secondary`. The first set is too literal; you're thinking in raw values rather than intent. The second set runs out of names the moment you need a third shade of anything.

Muul uses a different model: three roles, three tones each.

## The model

Every colour token has two parts — a role and a tone.

**Roles** describe what the colour is for:
- `background` — surfaces
- `foreground` — text and icons
- `border` — dividers and outlines
- `accent` — interactive and active states

**Tones** describe intensity within the role:
- default — primary use
- `subtle` — secondary, reduced emphasis
- `minimal` — barely-there, hover states, tints

This gives twelve tokens total:
```
--background          --foreground          --border          --accent
--background-subtle   --foreground-subtle   --border-subtle   --accent-subtle
--background-minimal  --foreground-minimal  --border-minimal  --accent-minimal
```

## Why this maps well to a content site

A blog has a limited set of visual problems to solve. Body text needs to be readable. Meta text — dates, read time, tag labels — needs to recede. Borders need to separate without dominating. Interactive elements need to be findable.

The token set maps directly to these problems:

- Body text → `--foreground`
- Date, read time, tags → `--foreground-subtle`
- Disabled or placeholder text → `--foreground-minimal`
- Page canvas → `--background`
- Code blocks, raised cards → `--background-subtle`
- Hover states → `--background-minimal`
- Dividers → `--border`
- Active nav link underline, focus ring → `--accent`

You rarely need to think about which token to reach for. The name tells you.

## Light and dark in one declaration

Every token is declared once using `light-dark()`:
```css
--foreground:        light-dark(#100F0F, #FFFCF0);
--foreground-subtle: light-dark(#6F6E69, #B7B5AC);
```

The browser picks the right value based on `color-scheme`. The theme toggle sets `color-scheme: dark` or `color-scheme: light` on `<html>`, which overrides the system preference. No duplicate declarations, no JavaScript colour switching, no class toggling.

## The palette

Muul's values are drawn from the [Flexoki](https://stephango.com/flexoki) palette by Steph Ango. Flexoki is designed for long reading sessions — warm neutrals, enough contrast, nothing that fatigues. The accent is a muted teal rather than a bright blue.

All values live in `src/styles/theme.css`. To change the look entirely, edit that one file. The token names stay the same; only the values change.

## Extending

The model has room to grow. If you need status colours — success, warning, error — add them below the existing palette in `theme.css`:
```css
--success:        light-dark(#3AA99F, #3AA99F);
--warning:        light-dark(#AD8301, #D0A215);
--error:          light-dark(#AF3029, #D14D41);
```

These don't need to follow the role/tone model — they're semantic colours for specific UI states, not general-purpose design tokens. The layer system accommodates both without conflict.