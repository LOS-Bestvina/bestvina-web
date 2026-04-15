# Bestvina Web Documentation

Welcome to the internal documentation for the Bestvina web application. 

This project is a modern NuxtJS web application designed for the Běstvina summer camp.

## Directory Structure

- `docs/api`: [API Endpoint Documentation](./api/README.md)
- `content/`: Markdown and Data files for Nuxt Content.
- `app/`: Main Vue application code (components, composables, pages).
- `server/`: Nitro full-stack server routes and utilities.
- `shared/`: Shared TypeScript types, constants, and utilities.

## Key Concepts

### Content Management
We use **Nuxt Content v3** to manage static and semi-static text. 
- Landing page content is stored in `content/landing.json`.
- Historical year data is stored in `content/years/`.
- People data is managed in `content/people/`.

### Image Pipeline
Images are hosted in `public/imgs/` and processed using **Nuxt Image**. 
- We use a custom `prerender.ts` script to generate optimized thumbnails at build time.
- Images are metadata-driven, mapped via `server/utils/imageService.ts`.

## Build and Prerender
To generate image routes for Nitro prerendering, run:
```bash
bun run prerender
```
Then proceed with the standard Nuxt build:
```bash
bun run generate
```
