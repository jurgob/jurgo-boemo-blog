# Repository Guidelines

## Project Structure & Module Organization
`src/` holds the React app: `components` for reusable UI, `pages` for routed entries, `templates` for programmatic pages, and styles in `style.css` plus `normalize.css`. Blog posts live in `content/blog/<slug>` folders that keep MD/MDX and assets together. Files that bypass Webpack belong in `static/`, Gatsby wiring lives in `gatsby-*.js`, and `public/` is disposable build output.

## Build, Test, and Development Commands
- `npm run develop` (`dev`): hot-reload server on `http://localhost:8000`.
- `npm run build`: production bundle; must pass before every PR.
- `npm run serve`: preview the last build.
- `npm run clean`: drop `.cache` and `public/` after data or plugin changes.
- `npm run format`: run Prettier across JS/TS/MD/JSON.
- `npm run deploy`: push the current build to Vercel once merged.

## Coding Style & Naming Conventions
Prettier (see `.prettierrc`) enforces two-space indents, no semicolons, and `arrowParens: avoid`. Stick to ES modules and ASCII unless a post needs Unicode. Components, hooks, and pages use `PascalCase`, helpers stay `camelCase`, and CSS classes follow `kebab-case`. Blog directories use `YYYYMMDD_slug` for dated pieces or `kebab-case` for evergreen work, with `camelCase` frontmatter keys.

## Testing Guidelines
`npm run test` only prints a reminder, so rely on manual verification. Always run `npm run build` before pushing to catch GraphQL or Sharp failures, then proof MDX in the dev server and grab screenshots for layout tweaks. Updates to `gatsby-node.js` or data plugins must include reproduction steps that prove pagination and feeds still succeed.

## Commit & Pull Request Guidelines
History favors concise, imperative commits (`new article`, `change code theme`), so keep subjects short and atomic. PR descriptions must summarize the change, link issues, and list validation commands (at minimum `npm run build`). Attach before/after captures for UI shifts and flag reviewers when deployment settings or environment variables change.

## Content & Deployment Tips
Duplicate an existing `content/blog/` folder to start a post, update frontmatter, and co-locate media. Use `draft: true` so `gatsby-plugin-draft` hides unfinished work. Put reusable diagrams under `static/assets/<topic>` and reference them via `/assets/...`. Rotate Vercel secrets in dashboard, not Git.

## Article Writing Style
Keep articles short and incremental: each section introduces one idea, demonstrates it with a minimal code block, then states the win before moving on. Favor short paragraphs, bullet lists, and runnable TS snippets. When a concept evolves, show the progression through successive diffs or numbered steps so the journey stays linear.
