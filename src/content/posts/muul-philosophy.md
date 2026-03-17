---
title: "Muul — A Foundation, Not a Framework"
description: "On why Muul exists, what it stands for, and what it deliberately leaves out."
published: 2025-12-27
tags:
  - muul
  - philosophy
---

Muul (मूळ) means *foundation* in Sanskrit. That name is the entire philosophy.

## What Muul is

A minimal Astro blog template built for people who write. Not for people who want to configure. The assumption is that you have things to say, and the template should get out of the way.

Muul provides:

- A clean reading experience out of the box
- Semantic HTML that works without JavaScript
- A dark/light theme that follows your system preference
- Posts, tags, and series — nothing more
- A single CSS variable file to make it yours

## What Muul is not

Muul is not a portfolio template. It has no project pages, no hero sections, no animations. If you need those things, Muul is the wrong starting point.

It is not opinionated about your writing. The content is yours. The template only decides how it is presented.

It is not dependent on any external styling library. Every line of CSS is written and owned by the template. No third-party updates will ever break your site's appearance.

## The decisions

Every design decision in Muul came from a question: *does this serve the writing, or does it serve the template?*

Posts are the primary object. Everything else — tags, series, navigation — exists to help readers find more posts. The home page shows recent writing. The posts index shows all writing. The tag pages show filtered writing. That is the entire information architecture.

Typography comes first. The font stack is deliberate — a serif for body text, a sans for headings, a monospace for code. Reading on a screen is already a compromise; the least a template can do is not make it worse.

## Extending Muul

Muul is a starting point. Fork it, break it, make it yours. The CSS variable file is designed to be the only thing you need to touch to change the look entirely. The content schema covers the common cases — add fields when your writing demands them, not before.

If you find yourself fighting the template, that is a signal. Either the template needs to change, or the content structure does. Muul should never win that argument.
