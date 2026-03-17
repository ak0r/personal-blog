---
title: "CSS Architecture of Muul"
description: "How Muul's six-file CSS layer system works, and why it's built that way."
published: 2026-03-01
tags:
  - muul
  - css
  - design-system
series: "Building Muul"
order: 1
---

Most blog templates reach for Tailwind, a UI framework, or a component library before writing a single line of CSS. Muul goes the other way. Every line of CSS is written and owned by the template. No third-party updates will ever change how your site looks.

This post explains how Muul's CSS is structured and why each decision was made.

## The problem with a single stylesheet

A single `global.css` file is fine when a project is small. It stops being fine when:

- You want to override a base style without fighting specificity
- You add a framework and it collides with your existing rules
- You can't tell whether a rule is a reset, a design token, or a component style

The solution is layers — a way to declare specificity order explicitly, independent of selector complexity.

## Six files, one entry point

Muul's stylesheet is split into six files, each with a single responsibility:
```
global.css      ← entry point only, no styles
reset.css       ← browser normalisation
tokens.css      ← design scale values
theme.css       ← colour values
base.css        ← semantic element styles
typography.css  ← prose rhythm
components.css  ← class-based utilities
```

`global.css` declares the layer order and imports each file:
```css
@layer reset, tokens, theme, base, typography, components;

@import './reset.css'      layer(reset);
@import './tokens.css'     layer(tokens);
@import './theme.css'      layer(theme);
@import './base.css'       layer(base);
@import './typography.css' layer(typography);
@import './components.css' layer(components);
```

The layer order declaration at the top is the most important line in the entire system. It means `components` always wins over `base`, regardless of selector specificity. A class in `components.css` will always override an element rule in `base.css` — predictably, without hacks.

## What each file is allowed to do

The files have strict contracts:

**`reset.css`** — browser normalisation only. `box-sizing`, margin reset, `tap-highlight`. Safe to replace with any reset.

**`tokens.css`** — static scale values only. Spacing steps, type scale, radius values, font weights, transitions. No colours. Numbers that don't change between light and dark mode.

**`theme.css`** — colour values only. Every colour uses `light-dark()` so both modes are declared in one place. This is the one file users are expected to edit.

**`base.css`** — element selectors only, no class selectors. Styles `a`, `h1`–`h6`, `code`, `pre`, `blockquote`, `table`, `button`. Frameworks can override these freely because `components` sits above `base` in the layer order.

**`typography.css`** — prose rhythm scoped to `.post-content` only. Paragraph spacing, image margins, list spacing in the context of a blog post. Nothing outside `.post-content` is affected.

**`components.css`** — class selectors only, no element selectors. `.container`, `.article`, `.nav-link`, `.sr-only`. Layout primitives and utilities.

## Adding Tailwind

Because the layer order is declared explicitly, adding Tailwind v4 is one line:
```css
/* global.css — after existing imports */
@import "tailwindcss";
```

Tailwind declares its own layers which slot in after the ones already declared. No conflicts, no specificity fights.

## What this buys you

The practical benefit is predictability. When something looks wrong, you know exactly which file to open. When you want to override something, you know exactly where to put it. When you add a framework, you know it won't fight your existing styles.

The next post covers the colour token system — how the three-role, three-tone model works and why it maps well to a content site.