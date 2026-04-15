# 🎨 Design Roast: Bestvina Web

> Let me be honest: the design isn't bad — it's just *safe*. It leans heavily on Nuxt UI's defaults, uses a competent color palette, and doesn't break anything. But "doesn't break anything" is not the same as "wows the user." Here's what's holding it back.

---

## 1. The Big Picture: What This Site Needs to Communicate

Before roasting individual choices, let's set expectations. Bestvina is a **science summer camp for elite high schoolers** from across the Czech Republic. The design should convey:

- 🧪 **Academic prestige** — top students, university-backed
- 🔥 **Excitement** — it's summer camp, it should feel alive
- 🌿 **Adventure** — outdoors, forests, tents, experiments
- 🤝 **Community** — the people section is half the site

Currently, the design reads like a **software product landing page** that someone has put camp photos into. The NuxtUI defaults are competent, but they create a SaaS feel, not a science adventure feel.

---

## 2. Hero Section: The First Impression Problem

### What you have:
```vue
<!-- SectionHero.vue — horizontally split hero with text + carousel -->
<UPageHero orientation="horizontal">
  <template #title>
    <span>Letní odborné soustředění
      <span class="bg-gradient-to-r from-teal-500 to-teal-300 
                   dark:from-teal-500 dark:to-teal-100 
                   bg-clip-text text-transparent animate-gradient">
        BĚSTVINA
      </span>
    </span>
  </template>
```

### What's wrong:

**The gradient text animation exists, but nothing else moves.** The animated gradient on "BĚSTVINA" is a nice touch, but the rest of the hero is completely static. For a summer camp aimed at 16-year-olds, this level of visual energy is like showing up to a pool party with a briefcase.

**"Letní odborné soustředění" is not a headline — it's a category label.** Nobody outside the Czech science olympiad world knows what "odborné soustředění" means. The first words on screen should hook the audience emotionally.

**The background is a blurred SVG with 7% opacity.** That's essentially invisible:
```vue
<!-- index.vue — the background nobody can see -->
<NuxtImg
  class="object-cover w-full h-full opacity-7 dark:opacity-7 fixed ..."
  src="imgs/hero_bg.svg"
/>
```
`opacity-7` (7%) is decorative noise at this level. Either commit to a background that creates atmosphere, use a real photograph with a gradient overlay, or remove it entirely and let the white/dark background breathe.

### What to do:
- Add a subtle parallax scroll effect on the hero image carousel
- Make the headline punchy: "Věda, příroda, komunita. Dva týdny, které nezapomeneš."
- Give the hero a genuine atmospheric background — a blurred nature photograph, not an SVG at 7% opacity
- Add `will-change: transform` to carousel for GPU acceleration

---

## 3. Typography: Using One Weight of Poppins is a Crime

```css
/* main.css — the entire typographic system */
--font-sans: 'Poppins', sans-serif;
```

Poppins is loaded but the weight configuration is **commented out**:

```ts
// nuxt.config.ts line 129
// weights: [200, 400, 500, 600, 700, 800, 900],
```

This means you're loading whatever the default weight Nuxt Fonts decides to grab. The Poppins typeface *needs* its weight spectrum to create hierarchy. Without deliberate weight contrast, all text reads at the same visual intensity.

**What a proper typographic scale looks like:**
```css
/* Instead of flat: everything is "font-bold" or default */

/* H1 — Hero titles */
font-size: 3.5rem–5rem; font-weight: 800; line-height: 1.1;

/* H2 — Section headers */
font-size: 2rem–2.5rem; font-weight: 700; line-height: 1.2;

/* H3 — Card titles */
font-size: 1.25rem–1.5rem; font-weight: 600;

/* Body */
font-size: 1rem; font-weight: 400; line-height: 1.6–1.8;

/* Caption/muted */
font-size: 0.875rem; font-weight: 400; letter-spacing: 0.01em;
```

**Specifically bad:**
```vue
<!-- rocniky/[slug].vue — overusing "font-bold text-secondary" for data values -->
<p class="text-2xl font-bold text-secondary">
  {{ formatDateRange(page.term.startDate, page.term.endDate) }}
</p>
```

The date display uses the same style as price and registration deadline. When everything is `font-bold text-secondary text-2xl`, nothing is emphasized.

---

## 4. Color Usage: Teal Everywhere is Teal Nowhere

```ts
// app.config.ts
colors: {
  primary: "teal",
  secondary: "orange",
  tertiary: "yellow",
  neutral: "zinc",
}
```

The palette itself is good — teal, orange, yellow creates a warm-cool contrast with energy. But **the accent colors are used too uniformly** to create emphasis.

```vue
<!-- rocniky/[slug].vue — teal used for dates, prices, deadlines -->
<p class="text-2xl font-bold text-secondary">{{ formatDateRange(...) }}</p>
<p class="text-2xl font-bold text-secondary">{{ formatPrice(...) }}</p>
<p class="text-2xl font-bold text-secondary">{{ formatDate(...) }}</p>
```

When every data point on the current year card is `text-secondary` (orange), orange communicates nothing. It becomes wallpaper. **Color should carry semantic meaning** — use orange for calls-to-action, teal for informational highlights, and neutral for supplementary data.

### Responsive color mode issue:
```vue
<!-- SectionHero.vue — hardcoded dark mode color in gradient -->
dark:from-teal-500 dark:to-teal-100
```

`teal-100` in dark mode is a very light teal (near white). On a dark background this creates extreme contrast. This should be `dark:to-teal-300` for a more harmonious gradient in dark mode.

---

## 5. Spacing & Layout: The Grid is Inconsistent

### InfoCard layout inconsistency
InfoCard has three layout modes — `single`, `columns`, `rows` — but the padding is different across all three:

```vue
<!-- InfoCard.vue — inconsistent padding between layouts -->
<!-- columns layout: -->
<div class="p-6 flex flex-col">

<!-- rows layout: -->
<div class="p-6 flex flex-col">   ← text section
<div class="px-6 pb-6 grow">      ← secondary (no top padding)

<!-- single layout: uses UCard body padding defaults -->
```

The result: cards next to each other on the same grid row have different internal padding, creating misaligned content baselines. On the information page, this is very visible when InfoCards sit side by side.

### The "md:col-span-2" pattern is overused
```vue
<!-- informace/index.vue — 4 out of 7 InfoCards use md:col-span-2 -->
class="md:col-span-2"
```

When the majority of cards span 2 of 3 columns, you're not using a 3-column grid — you're alternating between different implicit layouts. This creates visual chaos on medium screens (768–1024px) where the grid transitions.

---

## 6. Mobile Experience: Designed Desktop-First, Adapted Last

### The gallery sidebar is a nightmare on mobile

```vue
<!-- galerie.vue — sidebar that becomes a top bar on mobile with no indication -->
<div class="lg:sticky lg:top-(--ui-header-height) h-fit 
             grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 p-4">
```

On mobile, the "sidebar" is just content stacked at the top of the page. Users have to scroll past all the filter controls (including a label saying "Filtrování" and two select menus) to reach the actual photos. There's no "show filters" toggle, no sticky filter bar, no way to filter without scrolling back to the top.

**Expected pattern:** Filter button → bottom sheet (mobile) / sticky sidebar (desktop).

### Navigation icons disappear oddly on `/lide`
```vue
<!-- lide/index.vue — icon is hidden, then shown via responsive class -->
:ui="{
  leadingIcon: 'block 2xs:hidden md:block',
  label: 'hidden 2xs:block',
}"
```

Between the `2xs` (384px) and `md` (768px) breakpoints — a range covering most smartphones in portrait mode — the tab leading icons are visible but labels are hidden. This makes the tabs look like icon-only navigation without `aria-label` support. Either show both (resize them) or use icon-only with proper ARIA labels consistently.

### Touch target sizes
```vue
<!-- ImageDetailModal.vue — thumbnail buttons are 64×64px on mobile -->
class="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden"
```

`w-16` = 64px. Apple's HIG recommends 44px minimum, Google's Material Design recommends 48px. 64px is fine, but the `gap-2` (8px) between thumbnails combined means fingers can be imprecise and activate the wrong thumbnail. Increase gap to at minimum `gap-3` (12px) for touch.

---

## 7. The People Pages: A Feature That's Hiding

The people section is architecturally well-built (the `ScrollableGrid` with sections and `PersonCard`) but visually underdesigned. The person cards are:

```vue
<!-- PersonCard.vue — basic card with name, role, description -->
```

Without seeing the exact rendering, the pattern of:
- Grid of cards
- Each with photo (circle) + name + role title
- Sometimes a description

...reads like a generic "Our team" page. For a science camp where the people are a huge part of the appeal (students want to know who their teachers will be), this section deserves more personality:
- Subject-color badges (chemistry teal, biology green)
- A visual indicator of their camp role (lecturer vs. lab technician vs. medic)
- A hover state that reveals fun facts or a longer description
- Subtle card animations on scroll entrance

---

## 8. Animation: Quantity Over Quality

### What's there:
- Hero gradient text animation (`animate-gradient` in `SectionHero.vue`)
- Page transitions (`pageTransition: { name: "page", mode: "out-in" }` in nuxt.config)
- Image detail modal slide transitions (slide-left / slide-right)
- Loading spinners

### What's missing:
```vue
<!-- index.vue — landing sections just appear with no entrance animation -->
<LandingSectionHero />
<USeparator />
<LandingSectionReasons />
<USeparator />
<LandingSectionActivities />
```

The landing page sections have zero scroll-entrance animations. As a user scrolls down, each section simply exists. Modern landing pages use subtle `translate-y` + `opacity` scroll-triggered animations to create the sensation of the page "loading itself in" as you explore.

### The UBanner is jarring
```vue
<!-- app.vue — development banner on every page load -->
<UBanner
  id="in-development"
  title="Web je stále v raných fázích vývoje..."
  close
/>
```

A "this site is in development" banner is fine during actual development, but on a publicly deployed static site it communicates unprofessionalism. Either remove it for the production build (use `process.env.NODE_ENV` or a feature flag) or replace it with an actual informational banner (e.g., "Přihlášky na ročník 2026 jsou nyní otevřeny!").

---

## 9. The Kronika Page: Missed Opportunity for Storytelling

```vue
<!-- kronika.vue — a blog post list of years -->
<UBlogPosts>
  <UBlogPost
    v-for="(yearObj, index) in years"
    :title="`Ročník ${yearObj.year}`"
    :description="yearObj.theme"
    :image="{ src: yearObj.coverImg }"
    :to="`/rocniky/${yearObj.year}`"
  />
</UBlogPosts>
```

The Kronika (Chronicle) is a linear list of blog post cards. Each card shows:
- A title: "Ročník 2023"
- The theme: e.g. "Fotosyntéza"
- A cover image

This is effectively a card grid. But a **chronicle** implies history, time, progression. The design misses the storytelling opportunity entirely. Consider:

- A **timeline layout** instead of a grid — visually communicates that years flow from past to present
- Year labels styled as large decorative numbers in the background
- Cover images in a magazine-layout style (alternating left/right with description text)
- A subtle progression indicator from oldest year (sepia/muted) to current year (full color)

---

## 10. Dark Mode: Half-hearted

The site supports dark mode via `UColorModeButton`. The custom color definitions in `main.css` are carefully calibrated for light mode. But:

```css
/* main.css — teal-900 and teal-950 are both pitch black */
--color-teal-900: oklch(0% 0 none);
--color-teal-950: oklch(0% 0 none);
```

Both the 900 and 950 shades of the custom teal are identical black (`oklch(0% 0 none)`). This means any dark-mode usage of `teal-900` or `teal-950` (which NuxtUI may use internally) will produce unexpected results. A proper color scale should have distinct steps all the way down.

The `informace/index.vue` page hardcodes many classes with `bg-muted` layout — check that the "about camp" content cards are readable in dark mode. The `InfoCard.vue` uses `bg-muted` which should adapt, but the `UCarousel` inside has no explicit dark mode consideration.

The hero section gradient:
```vue
dark:from-teal-500 dark:to-teal-100
```
`teal-100` is a very light shade, nearly white. In dark mode this makes the gradient almost disappear into the background title. `dark:to-teal-300` or `dark:to-teal-200` would be more appropriate.

---

## 11. Accessibility: The Gaps

### Empty alt text on images in the gallery
```vue
<!-- ImageDetailModal.vue line 218 — blank alt text -->
<img
  :src="img(currentSrc, {}, { preset: 'thumbnailXXSm' })"
  alt=""    ← decorative placeholder OK here, but...
```

The main gallery images (`NuxtImg` in `JustifiedImageLayout.vue`) have no `alt` text derived from the image metadata (which includes `title` and `author`). Screen readers will read "image, image, image" for the entire gallery.

```vue
<!-- ✅ Use available metadata for alt text -->
<GalleryImage
  :alt="imgObj.image.title ?? `Foto od ${imgObj.image.author?.name ?? 'neznámého autora'}`"
  :src="imgObj.image.path"
/>
```

### `data-orientation=horizontal` in Header
```vue
<!-- Header.vue — functional attribute as selector (not semantic) -->
class="hidden lg:inline-flex ... data-[orientation=horizontal]:w-full"
```

Using data attributes as styling selectors is fine with Tailwind, but ensure the underlying `UNavigationMenu` sets `role="navigation"` and `aria-label="Hlavní navigace"`.

### Focus management in image modal
The `ImageDetailModal.vue` uses `autofocus` on the main image:
```vue
<NuxtImg autofocus .../>
```

`autofocus` on an `img` element doesn't work — images aren't focusable by default. The close button should receive focus when the modal opens, or the modal container itself should receive focus with `tabindex="-1"`.

---

## 12. The Loading States: Spinners Are for Carousels, Not Full Pages

```vue
<!-- lide/index.vue — entire people list behind ClientOnly with spinner -->
<ClientOnly>
  <UTabs ... />
  <PeopleScrollableGrid ... />
  <template #fallback>
    <div class="w-full h-full flex flex-row justify-center items-center my-16">
      <UIcon name="i-svg-spinners-bars-scale-middle" size="48" />
    </div>
  </template>
</ClientOnly>
```

The entire people section is gated behind `<ClientOnly>` with a spinner. This means:
1. SSR renders the header and nothing else
2. Client hydrates and the content flashes in
3. Users on slow connections see a spinner where all content should be

For a **static prerendered site**, `<ClientOnly>` on main content is almost always wrong. The data is already in the page's JSON payload from SSR — it just needs to be rendered. The `ClientOnly` was added to handle the tab state (which depends on `route.query`), but the solution should be to initialize tab state server-safely (defaulting to the first tab), not to hide all content.

---

## Summary: The Design Audit

| Area | Score | Primary Issue |
|---|---|---|
| Visual Identity | 6/10 | Looks like a SaaS product, not a science adventure camp |
| Typography | 5/10 | Commented-out weights, flat hierarchy |
| Color System | 7/10 | Good palette, poor semantic usage |
| Mobile Responsiveness | 5/10 | Gallery filters, tab icons, ClientOnly content |
| Animation & Motion | 5/10 | Only gradient text; no scroll entrance animations |
| Storytelling (Kronika) | 4/10 | Card grid ≠ chronicle; missed visual opportunity |
| Dark Mode | 6/10 | Functional but the custom palette has gaps |
| Accessibility | 5/10 | Missing alt text, focus management issues |
| Loading States | 4/10 | ClientOnly hides SSR content unnecessarily |

> **Overall Design Score: 5.2/10** — Would score 7+/10 with scroll animations, better mobile filter UX, and typography weight contrast. The visual potential is there — the color palette, the custom brand gradient, the justified gallery layout — but it's not being fully leveraged.
