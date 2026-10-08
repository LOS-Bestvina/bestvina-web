import { defineNuxtConfig } from "nuxt/config";
import { getApiRoutesToPrerender } from "./scripts/getPrerenderRoutes";
import { generateThumbnails } from "./scripts/generateThumbnails";
import { ACTIVE_ORGANIZER_ROUTES } from "./shared/constants";
import { IMAGE_PRESET_DEFINITIONS } from "./shared/constants/imagePresets";

export default defineNuxtConfig({
	modules: [
		"@nuxtjs/sitemap", // must appear before @nuxt/content
		"@nuxtjs/robots",
		"@nuxt/content",
		"@nuxt/eslint",
		"@nuxt/hints",
		"@nuxt/image",
		"@nuxt/ui",
		"@nuxt/scripts",
		// "nuxt-studio",
		"@vueuse/motion/nuxt",
	],
	ssr: true,
	imports: {
		dirs: [
			"composables/**",
		],
	},
	devtools: {
		enabled: true,
		timeline: {
			enabled: true,
		},
	},
	app: {
		pageTransition: {
			name: "page",
			mode: "out-in",
		},
	},
	css: ["~/assets/css/main.css"],
	content: {
		experimental: { sqliteConnector: "native" },
	},
	ui: {
		theme: {
			transitions: true,
			colors: [
				"primary",
				"secondary",
				"tertiary",
				"info",
				"success",
				"warning",
				"error",
			],
		},
		experimental: {
			componentDetection: true,
		},
		colorMode: true,
	},
	routeRules: {
		"/**": { },
		"/": { prerender: true },
		"/kronika": { prerender: true },
		"/rocniky/**": { prerender: true },
		"/lide": { prerender: true },
		"/lide/**": { prerender: true },
		"/kontakt": { prerender: true },
		"/galerie": { prerender: true },
		"/informace": { prerender: true },
		"/_studio": { ssr: true },
		"/api/**": { cors: true, prerender: true },
	},
	compatibilityDate: "2025-11-30",
	nitro: {
		// workaround for: https://github.com/nuxt/nuxt/issues/36467
		externals: {
			inline: [
				/[\\/]nuxt[\\/]dist/,
			],
		},
		prerender: {
			autoSubfolderIndex: false,
			crawlLinks: true,
			routes: [
				"/",
				...ACTIVE_ORGANIZER_ROUTES,
				"/lide/vedeni",
				"/lide/externi",
				"/lide/byvali",
			],
		},
		hooks: {
			async "prerender:done"() {
				await generateThumbnails();
			},
		},
	},
	vite: {
		optimizeDeps: {
			include: [
				"@vue/devtools-core",
				"@vue/devtools-kit",
			],
		},
	},
	hooks: {
		"prerender:routes"({ routes }) {
			getApiRoutesToPrerender().forEach(route => routes.add(route));
		},
		"prepare:types"({ sharedReferences }) {
			sharedReferences.push({ path: "./content/types.d.ts" });
			sharedReferences.push({ types: "bun-types" });
		},
	},
	eslint: {
		config: {
			stylistic: {
				semi: true,
				quotes: "double",
				commaDangle: "always-multiline",
				indent: "tab",
			},
		},
	},
	fonts: {
		families: [
			{
				name: "Poppins",
				provider: "google",
				weights: [400, 600, 800],
				preload: true,
				display: "swap",
			},
		],
	},
	icon: {
		customCollections: [{
			prefix: "my",
			dir: "./app/assets/icons",
		}],
	},
	image: {
		presets: IMAGE_PRESET_DEFINITIONS,
	},
});
