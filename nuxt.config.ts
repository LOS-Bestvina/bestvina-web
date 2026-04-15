import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { CURRENT_YEAR, OLDEST_YEAR } from "./shared/constants";

const imgsRoutesPath = resolve(".prerender/imgs-routes.json");

const getApiRoutesToPrerender = (): string[] => {
	const apiRoutes: string[] = [];

	for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
		apiRoutes.push(`/api/v1/images/gallery/${year}`);
		apiRoutes.push(`/api/v1/images/groups/${year}`);
	}

	// global API endpoints
	apiRoutes.push(`/api/v1/images/years`);
	apiRoutes.push(`/api/v1/images/photographers`);

	return apiRoutes;
};

const getImgRoutes = (): string[] => {
	if (!existsSync(imgsRoutesPath)) {
		throw new Error("File ./prerender/imgs-routes.json not found. You need to run `npm run prerender` first.");
	}
	try {
		return JSON.parse(readFileSync(imgsRoutesPath, "utf-8"));
	}
	catch (error) {
		throw new Error(`Getting imgs routes failed: ${error}`);
	}
};

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
			"hooks",
			"utils",
			"models/**",
			"types/**",
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
		// Homepage pre-rendered at build time
		"/": { prerender: true },
		"/kronika": { prerender: true },
		"/rocniky/**": { prerender: true },
		"/lide": { prerender: true },
		"/kontakt": { prerender: true },
		"/galerie": { prerender: true },
		"/informace": { prerender: true },
		"/_studio": { ssr: true },
		"/api/**": { cors: true, prerender: true },
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
