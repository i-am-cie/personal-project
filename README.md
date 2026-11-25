# MC Notes

A personal Minecraft notebook: survival notes, mod recommendations, castle builds and maps worth playing.

Live site: <https://i-am-cie.github.io/personal-project/>

## Pages

- `index.html` — home page: hero, what I am playing now, overview of the site
- `about.html` — how I got into Minecraft, servers, stories, creators I follow
- `survival.html` — survival notes in phases: day one, first three days, first week, late game
- `mods.html` — mod recommendations in four groups, filterable by category
- `builds.html` — castles built in survival mode, with what I learned about building
- `maps.html` — puzzle, PvP and survival-challenge maps
- `resources.html` — the sites I actually use

## Stack

- Hand-written HTML and CSS, no framework, no build step
- Semantic HTML (`header`, `nav`, `main`, `section`, `figure`, `footer`)
- Responsive layout, breakpoint at 640px
- A small amount of vanilla JavaScript in `js/main.js`:
  - category filter on the mods page
  - click-to-enlarge lightbox for screenshots
- Icons: `favicon.svg`, `favicon-32.png` (32×32), `apple-touch-icon.png` (180×180)
- Social preview: `og-image.jpg` (1200×630), referenced from every page with Open Graph tags
- Zero-dependency static checks in `tools/check-site.mjs` (Node 22, no install step)

## Deploy

Published with GitHub Pages from the `main` branch.

## Checks

`tools/check-site.mjs` verifies that every local link and asset resolves, every
image has an `alt`, external new-tab links carry `rel="noopener"`, each page has
the required Open Graph metadata, and element ids are unique. Run it locally:

```
node tools/check-site.mjs
```

GitHub Actions runs the same check on every push and pull request to `main`
(see `.github/workflows/ci.yml`). Warnings (for example an unreferenced
backup image) do not fail the build; errors do.
