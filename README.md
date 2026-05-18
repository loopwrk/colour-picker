# Colour Picker

A generative colour palette tool. Pick a harmony mode, click generate, get five
colours arranged as a donut chart with human-readable names from
[Color Pizza](https://api.color.pizza). Built as a personal project to get up to
speed with React.

> **Status: Work in progress.** Only the split-complementary harmony mode is
> wired up so far, and several planned features (locking, mobile layout, dark
> mode toggle, additional harmony modes, colour-blindness simulation, auto
> accessibility contrast, mobile optimisation) aren't there yet.

## What's working

- Split-complementary palette generation from a random base hue
- Donut chart with five segments
- Radial labels around the donut showing index, hex, and name
- Names fetched from the Color Pizza API (batched, cached, with retry on failure)
- A GENERATE button that produces a new palette

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Flowbite React for UI primitives
- TanStack Query for async state + caching
- i18next for translatable strings
- Vitest + React Testing Library

## Running locally

```sh
npm install
npm run dev        # start the dev server
npm run test       # run tests in watch mode
npm run test:run   # run tests once
npm run build      # production build
```

## Roadmap

- [ ] Additional harmony modes: complementary, triad, square, monochromatic, shades
- [ ] Colour-blindness simulation (deuteranopia, protanopia, tritanopia, monochromacy)
- [ ] Auto-contrast shift toggle for accessibility
