import { getApiRoutesToPrerender, getImgRoutes } from "./scripts/getPrerenderRoutes";

export default defineNuxtConfig({
	modules: [
		"@nuxt/content",
		"@nuxt/eslint",
		"@nuxt/hints",
		"@nuxt/image",
		"@nuxt/ui",
		"@nuxt/scripts",
		"nuxt-studio",
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
		rootAttrs: {
			id: "app",
		},
		pageTransition: {
			name: "page",
			mode: "out-in",
		},
	},
	css: ["~/assets/css/main.css"],
	content: {
		experimental: { nativeSqlite: true },
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
		"/**": { app: { layout: "page" } },
		"/": { app: { layout: "landing" }, prerender: true },
		"/kronika": { prerender: true },
		"/rocniky/**": { prerender: true },
		"/lide": { prerender: true },
		"/kontakt": { prerender: true },
		"/galerie": { prerender: true },
		"/informace": { prerender: true },
		"/_studio": { ssr: true },
		"/api/**": { cors: true, prerender: true },
		"/api/v1/images/galerie/**": { redirect: "/api/v1/images/gallery/**" },
	},
	compatibilityDate: "2025-11-30",
	nitro: {
		prerender: {
			autoSubfolderIndex: false,
			crawlLinks: true,
			routes: [
				"/",
				...getApiRoutesToPrerender(),
				...getImgRoutes(),
			],
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
				weights: [300, 400, 500, 600, 700, 800],
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
		presets: {
			thumbnailXXSm: {
				modifiers: {
					width: 20,
				},
			},
			thumbnailSm: {
				modifiers: {
					width: 240,
					quality: 50,
				},
			},
			thumbnailMd: {
				modifiers: {
					width: 480,
					quality: 50,
				},
			},
			thumbnailLg: {
				modifiers: {
					width: 720,
					quality: 50,
				},
			},
			thumbnailXLg: {
				modifiers: {
					width: 1080,
					quality: 50,
				},
			},
			thumbnailXXLg: {
				modifiers: {
					width: 1920,
					quality: 50,
				},
			},
		},
	},
	studio: {
		repository: {
			provider: "github",
			owner: "FelyCZ",
			repo: "bestvina-web",
			branch: "master",
		},
	},
});
