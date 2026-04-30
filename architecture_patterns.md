# 🏗️ Architecture & Design Patterns: Bestvina Web

> This document describes the design patterns and architectural decisions that apply to (or should apply to) this project, based on the current codebase and the stated goal of static-site hosting with a potential future conversion to hybrid rendering.

---

## 1. Rendering Architecture

### Current: Static Site Generation (SSG) with Prerendering

The site uses **Nuxt with `ssr: true` and full prerendering** via `routeRules` and Nitro's prerender config. At build time, every route is crawled and rendered to a static HTML+JSON file.

```
Build Time:
  nuxt build
    ├─ Crawls all routes
    ├─ Fetches content via queryCollection()
    ├─ Calls API endpoints (/api/v1/images/*)
    ├─ Renders HTML for each route
    └─ Outputs to .output/public/
```

**Key consequence:** The `getImagesForYear` function in `imageService.ts` reads the filesystem synchronously during prerender. In production, there is no server — the static API response is a pre-baked JSON file at `/api/v1/images/gallery/2024/index.json`.

### Future: Hybrid Rendering Path

The transition to hybrid rendering is architecturally straightforward because the existing separation of concerns is already well-aligned:

| Layer | SSG (now) | Hybrid (future) |
|---|---|---|
| Content (`/informace`, `/lide/*`) | Pre-rendered | Can stay pre-rendered or switch to ISR |
| Gallery API (`/api/v1/images/*`) | Pre-rendered JSON blobs | Can become live API routes |
| Dynamic data (current year) | Hardcoded constant | Could be fetched at runtime |
| Image modal URLs | Client-side URL params | No change needed |

The key transition point will be: **replace `getImgRoutes()` prerender bloat with on-demand ISR** (`routeRules: { '/api/**': { isr: true } }`).

---

## 2. Design Patterns in Use

### 2.1 Repository Pattern (Content Layer)

The `usePeopleData()` composable acts as a **Repository** — it encapsulates all queries to the `people` and `peoplePages` content collections, exposing semantic methods like `getAllActivePeopleSortedForPage()` instead of raw collection queries.

```
Page Component
  └─ usePeopleData()         ← Repository interface
       └─ queryCollection()  ← NuxtContent query (data source)
```

**Why it matters:** If you swap from Nuxt Content to a CMS API, only `usePeopleData.ts` changes — no page components need modification.

**Current weakness:** The repository also contains data transformation logic (e.g., `getPageSpecificOrDefaultPersonData` mutates the person object inline), violating separation between the repository and the domain model.

---

### 2.2 Strategy Pattern (Image Author Extraction)

`imageService.ts` uses a nascent strategy pattern for extracting author shortcuts from filenames — different strategies are applied based on the year. This is currently implemented as `if/else if` chains, but should be formalized (see code review doc).

```ts
// Implicit strategy selection by year:
if (year < 2024) → pre-2024 filename strategy
else if (year < 2025) → 2024 filename strategy
// TODO: 2025+
```

**Recommended formalization:**
```ts
interface AuthorExtractionStrategy {
  matches: (year: number) => boolean;
  extract: (filename: string) => string | undefined;
}
```

---

### 2.3 Flyweight Pattern (Image Minification)

The `MinifiedBestvinaImage` interface is a **Flyweight**: image data is pre-compressed into single-character keys (`p`, `y`, `w`, `h`, `ar`, `a`) before being written to the prerendered API JSON, reducing payload size.

```ts
// Full object (BestvinaImage) — used only at processing time
{ path, year, width, height, aspectRatio, author, title }

// Flyweight (MinifiedBestvinaImage) — stored and transferred
{ p, y, w, h, ar, a, t }
```

The `decodeBestvinaImage` function reconstructs the full object on the client, and importantly **re-hydrates the `author` object from the shared `IMAGE_AUTHORS` registry** rather than serialising the full author data into every image entry — a textbook Flyweight application.

---

### 2.4 Facade Pattern (Composables over APIs)

Each composable wraps a lower-level concern behind a cleaner interface:

| Facade | Wraps |
|---|---|
| `usePhotographers()` | `$fetch("/api/v1/images/photographers")` |
| `useAboutCamp()` | `queryCollection("aboutCampPage")` |
| `usePeopleData()` | multiple `queryCollection()` calls |
| `useBestvinaImages()` | multiple `$fetch` calls + caching + filtering |

**Benefit:** Page components never touch raw fetch calls or content queries directly — they consume semantic composables.

---

### 2.5 Observer Pattern (URL State Synchronization)

The gallery page and tab-based pages use Vue's `watch` to implement a **bidirectional observer** between component state and URL query params:

```
URL Query Params
    ↕ (watch bidirectional)
    Component State (selectedYears, selectedAuthors, currentTab)
```

This enables shareable, bookmarkable URLs. The pattern is implemented twice (gallery filters in `useBestvinaImages`, tab state in `lide/index.vue` and `informace/index.vue`) — the duplication is the issue, not the pattern itself.

---

### 2.6 Virtual DOM Windowing (Custom Virtualizer)

`JustifiedImageLayout.vue` implements a **custom virtual list/windowing** engine. instead of rendering all images in the DOM, it:

1. Computes the total scroll height upfront
2. Places items using `position: absolute` + `transform: translateY()`
3. Only renders items whose coordinates overlap the current `window.scrollY ± overscan`

```ts
// Virtualization at work:
const visibleItems = computed(() => {
  const overscan = 600;
  const viewTop = lastRenderedY.value - overscan;
  const viewBottom = lastRenderedY.value + windowHeight.value + overscan;

  return layoutData.value.layoutItems.filter((item) => {
    const itemBottom = item.top + item.height;
    return itemBottom > viewTop && item.top < viewBottom;
  });
});
```

The layout algorithm itself is a custom implementation of the **Justified Layout** algorithm (as seen in Flickr's justified-layout library) — computing row heights based on aspect ratios to fill the container width pixel-perfectly.

---

### 2.7 Command/Payload Pattern (URL-Encoded Image Modal)

`useImageDetail.ts` implements a mini **Command pattern** for deep-linkable image modal state. The image URL + metadata is encoded to a compact Base64 URL-safe string and stored in `?image=` query param:

```
Open Image → encodePayload({ src }) → Base64 → ?image=<token>
Share URL  → ?image=<token> → decodePayload() → Open Image
```

This allows directly sharing a URL that opens a specific image in the modal — a smart UX touch. The key/value compression (`src → s`) is an application of the Flyweight pattern to URL params.

---

### 2.8 Singleton Pattern (Module-Level Modal State)

```ts
// useImageDetail.ts — intentional module singleton
const isModalOpen = ref(false);
```

This is a deliberate **Singleton** — the modal open state is shared across all instances of `useImageDetail()` so that `app.vue` and image components can coordinate without prop-drilling. The singleton lifecycle is tied to the Nuxt app instance.

**Caveat:** Module-level singletons in Nuxt require care around SSR (each request should get its own state). Since `isModalOpen` is a UI-only concern and is only acted on client-side (`onMounted`), this is safe — but should be documented.

---

## 3. Content Architecture

### Content-as-Code (CaC)

The site uses **Nuxt Content v3** with a typed schema layer (`content.config.ts`) as its CMS. This is a Content-as-Code approach:

```
content/
├── about_camp/root.yml    ← Typed as AboutCampDataSchema (Zod)
├── people/individuals/    ← Typed as PeopleSchema (Zod)
│   └── *.md
├── people/*/              ← Page configuration in JSON
│   └── *.json
└── years/                 ← Typed as YearsPageSchema (Zod)
    └── *.yml
```

**Strengths:**
- Schema validation catches content errors at build time
- Non-developer editors can use Nuxt Studio
- Type-safe content access via generated types

**Weakness:** The Zod schema in `content.config.ts` is a monolithic 185-line file. As content types grow, this should be split into per-collection schema files.

---

### API-as-Static-Files

For images, the site uses a **pre-computed API** pattern: server routes read the filesystem at prerender time, compute minified image manifests, and write them as static JSON files. At runtime, the "API" is served as static files — zero server cost.

```
Build:  GET /api/v1/images/gallery/2024  → imageService.ts reads ./public/imgs/years/2024/gallery/
Output: .output/public/api/v1/images/gallery/2024.json

Runtime: Client fetches the static JSON (no server involved)
```

---

## 4. Data Flow Diagram

```
                    BUILD TIME
                    ──────────
Content Files (.yml/.md/.json)
        │
        ▼
  Nuxt Content DB (SQLite)
        │
        ▼
  queryCollection() (SSR)
        │
        ▼
  Page HTML + JSON hydration payload
        │ written to .output/
        ▼
                    RUNTIME (Client)
                    ────────────────
  [page load] → Static HTML served
        │
        ▼
  Vue hydrates → composables run
        │
        ├─── [image gallery page]
        │      $fetch('/api/v1/images/gallery/2024')  → static JSON
        │      useBestvinaImages() decodes + caches
        │      useJustifiedLayout() computes layout
        │      JustifiedImageLayout renders visible rows
        │
        └─── [people pages]
               usePeopleData() queries pre-hydrated content
               PeopleScrollableGrid renders sections
```

---

## 5. Component Architecture

### Hierarchy

```
app.vue (global: modal coordinator, head meta)
  └─ NuxtLayout
       ├─ layouts/landing.vue    → index.vue
       │    └─ UMain
       │         └─ Landing* sections
       │
       └─ layouts/page.vue       → all other pages
            ├─ AppHeader
            ├─ UMain > UContainer
            │    └─ <slot> (page content)
            └─ AppFooter
```

### Component Classification

| Type | Examples | Purpose |
|---|---|---|
| **Page containers** | `UPage`, `UPageHeader`, `UPageBody` | Nuxt UI layout primitives |
| **Feature components** | `JustifiedImageLayout`, `PeopleScrollableGrid` | Complex domain-specific UI |
| **Compound components** | `InfoCard` | Configurable multi-layout card |
| **Atomic UI** | `CopyButton`, `PlaceHolder`, `BestLoader` | Single-purpose building blocks |
| **Content overrides** | `ProsePageSubHeader` | Nuxt Content prose slot overrides |

---

## 6. State Management Strategy

The project uses **no Pinia store** — all state is managed via:

1. **URL query params** — shareable filter/tab state (gallery, lide tabs)
2. **`useState()`** — SSR-safe cross-component state (image cache keyed by type)
3. **Module-level refs** — intentional singletons (`isModalOpen`)
4. **`useAsyncData()`** — request-deduped async state with caching

This is appropriate for the current scope. If the site grows to include user authentication, favourites, or shopping (e.g., a camp registration flow), a Pinia store should be introduced.

---

## 7. Error Handling Strategy

The current strategy is:
- **404 errors** → `throw createError({ statusCode: 404, fatal: true })` → Nuxt error boundary → `error.vue`
- **API errors** → caught in composables, stored in `error` ref, silently ignored with `return []`
- **Content not found** → `if (!page.value) throw createError(...)` at the page level

**Gap:** API errors in composables are swallowed:
```ts
// imageService.ts — error suppressed
catch (error) {
  console.log(error); // ← not even console.error
  return [];
}
```

For production, consider an error reporting integration (Sentry, etc.) and user-visible error states in the gallery when images fail to load.

---

## 8. SEO & Performance Architecture

### SEO
- `useHead()` sets base title + viewport in `app.vue`
- Page-specific meta is left to individual page components (inconsistently implemented)
- The `seo.siteName` in `app.config.ts` is set but not actively used for og:site_name meta

**Missing:** `useSeoMeta()` or `useServerSeoMeta()` calls on individual pages for `og:title`, `og:description`, `og:image`. The content schemas have `title` and `description` fields — these should feed into SEO meta automatically.

### Performance
- **Image optimization**: `@nuxt/image` with presets for responsive thumbnails (XXSm → XXLg)
- **Lazy loading**: Gallery uses custom virtualizer for DOM efficiency
- **Prefetching**: `prefetch-on="visibility"` on hero CTAs
- **Font loading**: Poppins via `@nuxt/fonts` with `display: swap` to prevent FOIT
- **Code splitting**: `LazyImageDetailModal` is lazy-loaded via `overlay.create()`

---

## 9. Extensibility Points

When the site needs to grow, here is where to hook in:

| Future need | Where to add |
|---|---|
| User authentication | New Pinia store + `auth` middleware in `app/middleware/` |
| Camp registration form | New `content/registration/` collection + form page |
| Admin panel | Nuxt Studio already integrated (`nuxt-studio` module) |
| Full CMS | Swap `content/` files for API calls in composables only |
| Real-time gallery updates | Switch `/api/v1/images/**` from `prerender: true` to `isr: 3600` |
| i18n | `@nuxtjs/i18n` module + language-prefixed routes |
| E-commerce (prints) | Separate Nuxt app or module with Stripe integration |
