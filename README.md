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

## Deploy

Published with GitHub Pages from the `main` branch.
