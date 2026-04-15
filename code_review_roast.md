# 🔥 Code Review Roast: Bestvina NuxtJS App

> **Verdict:** Solid foundation with some genuinely clever solutions (custom justified layout engine, image payload encoding), but the codebase suffers from structural inconsistencies, leaky abstractions, and a few "we'll fix it later" patterns that quietly compound into technical debt. Let's dig in.

---

## 1. NuxtJS Best Practices

### 1.1 — Auto-imports used inconsistently

Nuxt auto-imports composables from `app/composables/`, yet several files explicitly import Vue primitives that are already auto-imported:

```ts
// ❌ useBestvinaImages.ts — pointless explicit imports
import { computed, type MaybeRefOrGetter, ref, toValue, watchEffect } from "vue";

// ❌ useJustifiedLayout.ts
import { computed, markRaw, type Ref } from "vue";

// ❌ useImageDetail.ts
import { watch } from "vue";
```

These are all auto-imported by Nuxt. You're literally importing what Nuxt is already injecting. Pick a lane: either trust Nuxt's auto-imports everywhere, or disable them and be explicit everywhere. This hybrid is just noise.

```ts
// ✅ Refactored — remove the explicit Vue imports; Nuxt handles it
export const useBestvinaImages = (
  type: "gallery" | "groups",
  requestedYears?: MaybeRefOrGetter<string | string[]>,
  options: BestvinaImagesOptions = { enableUrlSync: false },
) => {
  // ref, computed, watch, etc. are all available without import
  const pending = ref(true);
  // ...
};
```

---

### 1.2 — `useState` used incorrectly as image cache

```ts
// ❌ useBestvinaImages.ts line 82–85
const groupedImages = useState<Record<string, BestvinaImage[]>>(
  `images-${type}-cache`,
  () => shallowRef({}), // ← shallowRef inside useState is wrong
);
```

`useState` stores a plain reactive value — not a ref. Wrapping its initializer in `shallowRef` creates a ref-in-a-ref double-wrapping that is confusing and potentially broken. If you need server/client state hydration, use `useState` properly. If you just want client-side mutable state, use `ref`.

```ts
// ✅ Correct usage
const groupedImages = useState<Record<string, BestvinaImage[]>>(
  `images-${type}-cache`,
  () => ({}),
);
```

---

### 1.3 — `useAsyncData` key is a function, not a string

```ts
// ❌ usePeopleData.ts line 50–51
return useAsyncData(
  () => `page-data-${toValue(pageId)}`, // ← key must be a string, not a function
  () => queryCollection("peoplePages")...
);
```

`useAsyncData`'s first argument is the cache key, which must be a **static string**. Passing a function here produces a non-deterministic key and breaks deduplication and SSR hydration. Use `computed` to derive the key before calling `useAsyncData`, or call it at the call-site with the resolved value.

```ts
// ✅ Refactored
const getPageData = (pageId: MaybeRefOrGetter<string>) => {
  const key = computed(() => `page-data-${toValue(pageId)}`);
  return useAsyncData(
    key.value,
    () => queryCollection("peoplePages")
      .where("stem", "=", `people/${toValue(pageId)}`)
      .first(),
    { watch: [() => toValue(pageId)] },
  );
};
```

---

### 1.4 — `nuxt.config.ts` bloat: build logic at config time

```ts
// ❌ nuxt.config.ts lines 7–32
const getApiRoutesToPrerender = (): string[] => { ... };
const getImgRoutes = (): string[] => {
  if (!existsSync(imgsRoutesPath)) {
    throw new Error("File ./prerender/imgs-routes.json not found...");
  }
  ...
};
```

`nuxt.config.ts` should declare configuration, not run FS-dependent business logic. Throwing errors during config evaluation will crash `nuxt dev`, `nuxt build`, and any CI step that reads the config without the expected JSON file present. This should live in a dedicated build script (the separate `prerender.ts` already exists — put it there or in a Nitro build hook).

```ts
// ✅ Move to a separate module
// scripts/getPrerenderRoutes.ts
export function getApiRoutesToPrerender(): string[] { ... }
export function getImgRoutes(): string[] { ... }

// nuxt.config.ts — only declare, don't compute
import { getApiRoutesToPrerender, getImgRoutes } from "./scripts/getPrerenderRoutes";
```

---

### 1.5 — `definePageMeta` with `layout: "page"` repeated on every page

Every page file has:
```ts
// ❌ Repeated in: galerie.vue, kontakt.vue, kronika.vue, rocniky/[slug].vue, informace/index.vue...
definePageMeta({ layout: "page" });
```

This is the definition of "repeated configuration" that screams for a global route rule. Use the `routeRules` in `nuxt.config.ts` or define the default layout in `app.vue` / a parent layout.

```ts
// ✅ nuxt.config.ts — set default layout
app: {
  // ...
},
// OR use a layout middleware that applies "page" to all non-landing routes
```

---

### 1.6 — `test.vue` and `test2.vue` committed to `pages/`

```
app/pages/test.vue   ← 201 bytes
app/pages/test2.vue  ← 1496 bytes
```

These are **live routes** in your application: `/test` and `/test2` are publicly accessible on your static site. Debug/test pages should never be committed to `pages/` — use a `playground/` directory, a story, or at minimum add them to `routeRules` with `{ redirect: '/' }`.

---

### 1.7 — Hardcoded `CURRENT_YEAR` constant

```ts
// ❌ shared/constants.ts line 6
export const CURRENT_YEAR = 2026;
```

This has to be manually updated every year. For a static site this is acceptable, but coupling `nuxt.config.ts`, API routes, page logic, AND header navigation all to this constant means you will forget to update it somewhere. At minimum, derive it:

```ts
// ✅ shared/constants.ts
export const CURRENT_YEAR = new Date().getFullYear();
// Or if you need it frozen at build time for static output:
export const CURRENT_YEAR = Number(process.env.CURRENT_YEAR ?? new Date().getFullYear());
```

---

## 2. SOLID Principles

### 2.1 — Single Responsibility Principle (SRP) violations in `useBestvinaImages`

`useBestvinaImages` is a 246-line composable doing all of:
- Fetching available years from API
- Fetching images per year
- Managing a global client-side cache (`useState`)
- Filtering by author & year
- URL query parameter synchronization
- Random image selection
- Derived author list computation

That is **6–7 distinct responsibilities** in one function. When the caching strategy needs to change, you touch the URL sync code. When filtering logic changes, you touch the fetching code.

```ts
// ✅ Split into focused composables:

// useImageYears.ts — fetches and caches year metadata
export const useImageYears = () => { ... };

// useImageCache.ts — manages the in-memory image cache by year
export const useImageCache = (type: "gallery" | "groups") => { ... };

// useImageFilters.ts — manages selectedYears, selectedAuthors, filtering
export const useImageFilters = (images: Ref<...>, options?: ...) => { ... };

// useImageUrlSync.ts — syncs filter state to URL query params
export const useImageUrlSync = (filters: ReturnType<typeof useImageFilters>) => { ... };
```

---

### 2.2 — Open/Closed Principle (OCP) in `imageService.ts` author extraction

```ts
// ❌ imageService.ts lines 42–58 — adding a new year requires modifying this function
export const extractAuthorShortcut = (filename: string, year: number): string => {
  if (year < 2024) {
    foundShortcut = filename.split("-")[3];
  } else if (year < 2025) {
    foundShortcut = filename.split("__")[...];
  }
  // TODO: implement logic for 2025+ images
};
```

The function is closed for extension. Every new year requires opening and modifying `extractAuthorShortcut`. This is a classic OCP violation. Use a strategy/registry pattern:

```ts
// ✅ Refactored — open for extension, closed for modification
type AuthorExtractor = (filename: string) => string | undefined;

const authorExtractors: Array<{ fromYear: number; toYear: number; extract: AuthorExtractor }> = [
  {
    fromYear: 2010,
    toYear: 2023,
    extract: (filename) => filename.split("-")[3],
  },
  {
    fromYear: 2024,
    toYear: 2024,
    extract: (filename) => filename.split("__")[2]?.split("_")[0]?.split(".")[0]?.toLowerCase(),
  },
  // New years → add here, never modify existing entries
];

export const extractAuthorShortcut = (filename: string, year: number): string => {
  const strategy = authorExtractors.find(e => year >= e.fromYear && year <= e.toYear);
  const shortcut = strategy?.extract(filename);
  return IMAGE_AUTHORS.some(a => a.shortcut === shortcut) && shortcut ? shortcut : "unknown";
};
```

---

### 2.3 — Liskov Substitution / Interface Segregation in `InfoCard.vue`

`InfoCard.vue` uses a `layout` string discriminant to render three structurally different components inside one template — `'single'`, `'columns'`, `'rows'`. Each layout variant has different slot bindings and internal structure. This violates ISP: consumers are forced to understand all three layouts to use any one of them, and the internal template has duplicated icon/header markup for each variant.

```vue
<!-- ❌ InfoCard.vue — 154 lines of v-if/v-else-if switching on layout -->
<div v-if="layout === 'columns'" ...>
  <!-- icon, title, description markup -->
</div>
<div v-else-if="layout === 'rows'" ...>
  <!-- SAME icon, title, description markup duplicated -->
</div>
<template v-else>
  <!-- SAME icon, title, description markup duplicated again -->
</template>
```

```vue
<!-- ✅ Refactored — extract shared header, compose layouts -->
<!-- InfoCardHeader.vue — single responsibility: render icon + title + description -->
<template>
  <div>
    <div v-if="icon" class="..."><UIcon :name="icon" /></div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<!-- InfoCardColumns.vue -->
<template>
  <UCard class="...">
    <div class="grid grid-cols-1 md:grid-cols-2">
      <InfoCardHeader :title :description :icon :reversed>
        <slot name="extra" />
      </InfoCardHeader>
      <slot name="secondary" />
    </div>
  </UCard>
</template>
```

---

### 2.4 — Dependency Inversion Principle (DIP) in `JustifiedImageLayout.vue`

```vue
<!-- ❌ JustifiedImageLayout.vue line 88–99 — directly calls useImageDetail -->
const { openImage } = useImageDetail();
const openImageDetail = (src: string) => { ... openImage(src, images) };
```

The layout component now has a **hard dependency** on the image detail system. It cannot be reused in a context where you don't want the detail modal (e.g., the grade gallery preview). The behavior should be inverted — let the parent decide what clicking an image does.

```vue
<!-- ✅ Refactored — emit an event, invert the dependency -->
<!-- JustifiedImageLayout.vue -->
const emit = defineEmits<{ imageClick: [src: string, allImages: string[]] }>();

// in template:
@click="emit('imageClick', imgObj.image.path, allImages)"

<!-- galerie.vue — caller decides the action -->
<JustifiedImageLayout
  :grouped-images="filteredGroupedImages"
  @image-click="openImage"
/>
```

---

## 3. Clean Code Issues

### 3.1 — `@ts-expect-error` used as a crutch

```ts
// ❌ usePeopleData.ts lines 27–30
// @ts-expect-error unresolved reference
person.roleTitle = selectedPagePersonData.roleTitle;
// @ts-expect-error unresolved reference
person.role = selectedPagePersonData.role;
```

This exists because `PeopleCollectionItem` doesn't have `roleTitle` and `role` in its type definition, but you're mutating the object to add them. This is the type system telling you: "the data model is wrong." The fix is to properly type the extended person object, not to suppress the error.

```ts
// ✅ Define the extended type
// shared/types/people.d.ts
export interface PeopleCollectionItemExtended extends PeopleCollectionItem {
  id: string;
  roleTitle?: string;
  role?: string;
}

// usePeopleData.ts — cast the return appropriately
return { ...person, roleTitle: ..., role: ... } as PeopleCollectionItemExtended;
```

---

### 3.2 — Magic strings scattered throughout the codebase

```ts
// ❌ found in multiple places
"people/individuals/"   // usePeopleData.ts line 41
"people/"               // usePeopleData.ts line 117
"people/${toValue(pageId)}" // usePeopleData.ts lines 54, 128
```

```ts
// ❌ imageService.ts lines 82
path: `/imgs/years/${year}/${type}/${file}`,
```

These string literals are duplicated across multiple functions. A typo in one breaks data loading silently.

```ts
// ✅ Centralize path construction
// shared/constants.ts
export const PATHS = {
  PEOPLE_INDIVIDUALS_STEM: "people/individuals/",
  PEOPLE_PAGES_STEM: "people/",
  IMAGE_PATH: (year: string, type: string, file: string) => `/imgs/years/${year}/${type}/${file}`,
} as const;
```

---

### 3.3 — Commented-out code left in production files

```vue
<!-- ❌ kontakt.vue lines 108–115 — large block of commented HTML -->
<!--    <div class="flex flex-col gap-4 text-center whitespace-pre-wrap">
          <p class="font-">{{ person.organization }}</p>
          <p class="text-muted">{{ person.address }}</p>
        </div> -->

<!-- ❌ lide/index.vue lines 73–75 — commented out onMounted -->
// onMounted(() => {
//   checkInitialRouteQueryParameter();
// });
```

```vue
<!-- ❌ kontakt.vue lines 154–157 — large commented component -->
<!-- <InDevelopment :action="contactAction" description="..." /> -->
```

Git exists for a reason. Delete dead code. If you want to keep the option, use a feature flag.

---

### 3.4 — Contacts data hardcoded in component

```ts
// ❌ kontakt.vue lines 29–53 — contact data hardcoded in component script
const contacts = ref<ContactInterface[]>([
  { name: "Jan Kotek", role: "hlavní vedoucí", organization: "...", email: "modrej@natur.cuni.cz" },
  { name: "Zuzana Kotková", ... },
  { name: "Petr Šíma", ... },
]);
```

Contact information changes. When it does, a developer has to find this component, edit the code, rebuild, and redeploy. This data belongs in the `content/` directory, managed via Nuxt Content — exactly for this purpose.

```yaml
# content/contacts.json
[
  { "name": "Jan Kotek", "role": "hlavní vedoucí", ... },
  ...
]
```

```ts
// ✅ kontakt.vue
const { data: contacts } = await useAsyncData("contacts", () =>
  queryCollection("contacts").all()
);
```

---

### 3.5 — Placeholder/lorem content committed to production

```vue
<!-- ❌ informace/index.vue lines 241–254 — lorem ipsum in production code -->
<AboutTabbedCard
  description="adsfklajfkladjfaljfdlakjkldfaklsdjfakl;dsfjadskfl;afj; aksjfkad adjs fads fjkda jakl dfadsf"
  image="/imgs/cat1.jpg"
  title="Chemie"
/>
<AboutTabbedCard
  description="adsfklajfkladjfaljfdlakjkldfaklsdjfakl;dsfjadskfl;afj; aksjfkad adjs fads fjkda jakl dfadsf"
  image="/imgs/cat2.jpg"
/>
```

`/imgs/cat1.jpg`? Cat images? Lorem ipsum gibberish? **In production?** This content should be coming from `content/about_camp/` via the `chemistry` and `biology` schema fields that are already defined in `content.config.ts`. The schema is there, the data layer is there — use it!

---

### 3.6 — `getPersonCountLabel` is an untestable inline utility

```ts
// ❌ ScrollableGrid.vue lines 64–68 — Czech pluralization logic in component
function getPersonCountLabel(count: number): string {
  if (count === 1) return "osoba";
  if (count >= 2 && count <= 4) return "osoby";
  return "osob";
}
```

Czech pluralization rules are non-trivial. This utility should be in `shared/utils/` as a pure, tested function. The Intl.PluralRules API handles this natively:

```ts
// ✅ shared/utils/i18n.ts
const csRules = new Intl.PluralRules("cs");
const personLabels: Record<string, string> = {
  one: "osoba", few: "osoby", many: "osob", other: "osob",
};

export function formatPersonCount(count: number): string {
  return personLabels[csRules.select(count)] ?? "osob";
}
```

---

### 3.7 — `asSection` type escape hatch

```ts
// ❌ ScrollableGrid.vue line 70 — suppress TypeScript rather than fix the types
const asSection = (s: unknown) => s as Section;
```

This exists because `UScrollArea` presumably returns slot items as `unknown`. The correct fix is to type the `UScrollArea` usage correctly using generics or a typed wrapper, not to cast to `unknown` then to `Section`.

---

### 3.8 — Side effects at module initialization time in composables

```ts
// ❌ useBestvinaImages.ts line 208 — called immediately at composable creation
fetchYears();
watchEffect(() => {
  if (yearsLoaded.value && ...) fetchImages();
});
```

Calling `fetchYears()` at the top level of the composable means it runs the moment the composable is instantiated — including during SSR. This makes the composable harder to test, harder to reason about, and harder to control when data should be fetched. Move side effects into explicit lifecycle hooks or expose a `initialize()` method.

---

## 4. Maintainability & Scalability Issues

### 4.1 — Duplicated tab + URL sync pattern

The exact same tab-URL synchronization logic is duplicated in **both** `lide/index.vue` and `informace/index.vue`:

```ts
// ❌ Duplicated verbatim in TWO pages:
const currentTab = ref(tabs[0]!.value as string);

watch(() => route.query.t, (newTab) => {
  if (newTab && tabs.some(tab => tab.value === newTab)) {
    currentTab.value = newTab as string;
  }
}, { immediate: true });

watch(currentTab, (newTab) => {
  if (newTab !== route.query.t) {
    router.push({ path: "...", query: { t: newTab } });
  }
});

const checkInitialRouteQueryParameter = () => { ... };
```

Extract this into a reusable composable:

```ts
// ✅ composables/useTabUrlSync.ts
export function useTabUrlSync(tabs: TabsItem[], defaultPath: string) {
  const route = useRoute();
  const router = useRouter();
  const currentTab = ref(tabs[0]!.value as string);

  watch(() => route.query.t, (newTab) => {
    if (newTab && tabs.some(t => t.value === newTab)) {
      currentTab.value = newTab as string;
    }
  }, { immediate: true });

  watch(currentTab, (newTab) => {
    if (newTab !== route.query.t) {
      router.push({ path: defaultPath, query: { t: newTab }, hash: route.hash });
    }
  });

  const validateInitialTab = () => {
    const validValues = [...tabs.map(t => t.value), ""];
    if (!validValues.includes(route.query.t as string)) {
      router.push({ path: defaultPath });
      currentTab.value = tabs[0]!.value as string;
    } else {
      currentTab.value = route.query.t as string;
    }
  };

  return { currentTab, validateInitialTab };
}
```

---

### 4.2 — `lide/byvali.vue`, `lide/externi.vue`, `lide/vedeni.vue` are near-identical

```ts
// ❌ All three are basically:
definePageMeta({ layout: "page" });
const pageId = PEOPLE_PAGES.FORMER; // or LEADERSHIP, or EXTERNAL
const { data: page } = await getPageData(pageId);
if (!page.value) throw createError(...);
// Then template with UPage > UPageHeader > PeopleScrollableGrid
```

Three files. ~35 lines each. 90% identical. This screams for a single dynamic route:

```
// ✅ pages/lide/[section].vue — handles vedeni, externi, byvali
// Use a mapping to resolve section slug → PEOPLE_PAGES constant
const sectionMap: Record<string, PeoplePageId> = {
  vedeni: PEOPLE_PAGES.LEADERSHIP,
  externi: PEOPLE_PAGES.EXTERNAL,
  byvali: PEOPLE_PAGES.FORMER,
};
```

---

### 4.3 — `shared/models/` directory is empty

```
shared/models/  ← empty directory
```

The `nuxt.config.ts` imports from `models/**` in the `imports.dirs` config. An empty directory is a placeholder that adds cognitive overhead with zero value. Remove it or populate it.

---

### 4.4 — `app/utils/` directory is also empty

Same issue. Empty directories that are referenced in config but contain nothing should be cleaned up.

---

### 4.5 — `CURRENT_YEAR` compared with `==` not `===`

```ts
// ❌ rocniky/[slug].vue line 19
const isCurrentYear = ref(page.value?.year == CURRENT_YEAR || false);
```

`page.value.year` is a `number`, `CURRENT_YEAR` is a `number`. Use strict equality. Loose equality with numbers is bug-prone and misleading to readers.

```ts
// ✅
const isCurrentYear = computed(() => page.value?.year === CURRENT_YEAR);
```

---

### 4.6 — `isModalOpen` is module-level state in `useImageDetail`

```ts
// ❌ useImageDetail.ts line 76 — singleton state leaks across all composable instances
const isModalOpen = ref(false);

export function useImageDetail(options: ...) {
  // ...uses isModalOpen from module scope...
}
```

This is intentional (for the app.vue + component coordination) but undocumented and fragile. If a second modal is ever added, this will silently break. At minimum, document why it's module-level. Better: use Pinia or `useState` with a named key to make the singleton intent explicit.

---

## 5. Ideal Project Structure

The current structure is mostly good, but can be improved for scalability:

```
bestvina-web/
├── app/
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css
│   │   ├── fonts/
│   │   └── icons/
│   ├── components/
│   │   ├── app/              # App-level: Header, Footer
│   │   ├── base/             # NEW: truly generic reusable (BaseButton, BaseCard)
│   │   ├── content/          # Nuxt Content prose overrides
│   │   ├── gallery/          # Gallery-specific components
│   │   ├── grade/            # Grade/year preview components
│   │   ├── landing/          # Landing page sections
│   │   ├── page/             # Page-level layout components (SubHeader etc.)
│   │   ├── people/           # People-related components
│   │   └── ui/               # NEW: Custom UI components wrapping NuxtUI
│   │       └── InfoCard/     # Complex components get their own folder
│   │           ├── InfoCard.vue
│   │           ├── InfoCardColumns.vue
│   │           ├── InfoCardRows.vue
│   │           └── InfoCardSingle.vue
│   ├── composables/
│   │   ├── data/             # RENAMED: data fetching composables
│   │   │   ├── useAboutCamp.ts
│   │   │   ├── usePeopleData.ts
│   │   │   └── usePhotographers.ts
│   │   ├── gallery/          # NEW: gallery-specific composables
│   │   │   ├── useImageCache.ts
│   │   │   ├── useImageFilters.ts
│   │   │   ├── useImageUrlSync.ts
│   │   │   └── useImageYears.ts
│   │   ├── ui/               # NEW: UI behavior composables
│   │   │   ├── useImageDetail.ts
│   │   │   ├── useJustifiedLayout.ts
│   │   │   └── useTabUrlSync.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   ├── landing.vue
│   │   └── page.vue
│   ├── pages/
│   │   ├── galerie.vue
│   │   ├── index.vue
│   │   ├── informace/
│   │   │   └── index.vue
│   │   ├── kontakt.vue
│   │   ├── kronika.vue
│   │   ├── lide/
│   │   │   ├── [section].vue   # MERGED: vedeni + externi + byvali → dynamic
│   │   │   └── index.vue
│   │   └── rocniky/
│   │       └── [slug].vue
│   └── utils/                 # Actually used utilities (or remove if empty)
├── content/
│   ├── about_camp/
│   ├── contacts.json          # NEW: move hardcoded contacts here
│   ├── people/
│   └── years/
├── scripts/                   # NEW: build-time scripts (not in nuxt.config)
│   └── getPrerenderRoutes.ts
├── server/
│   ├── api/
│   │   └── v1/
│   │       └── images/
│   │           ├── [type]/
│   │           │   └── [year].get.ts
│   │           ├── photographers.get.ts
│   │           └── years.get.ts
│   └── utils/
│       ├── imageService.ts
│       └── authorExtractor.ts  # NEW: extracted author logic
├── shared/
│   ├── constants.ts
│   ├── types/
│   │   ├── people.d.ts
│   │   └── photographer.d.ts
│   └── utils/
│       ├── arrays.ts
│       ├── i18n.ts             # NEW: Czech pluralization utils
│       ├── imageMapper.ts
│       └── photographers.ts
├── content.config.ts
├── nuxt.config.ts
└── package.json
```

---

## Summary Scorecard

| Category | Score | Notes |
|---|---|---|
| NuxtJS Practices | 6/10 | Good module use, but config bloat, wrong `useState`, key issues |
| SOLID | 5/10 | SRP violated in composables, OCP in imageService, DIP in layout |
| Clean Code | 5/10 | Commented code, dead pages, lorem ipsum, hardcoded data, `@ts-expect-error` |
| Maintainability | 6/10 | Good separation overall, but duplicated patterns hurt |
| Scalability | 6/10 | Good content architecture, but composables will become unmanageable |

> **Overall: 5.6/10** — Not bad! The bones are solid. The architecture shows genuine thought (layout virtualization, URL-encoded image state, prerender pipeline). But the execution has rough edges that will compound as the site grows.
