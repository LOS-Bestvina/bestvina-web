export interface ImagePresetModifier {
	width?: number;
	height?: number;
	quality?: number;
	format?: "webp" | "jpeg" | "png";
}

export interface ImagePresetDefinition {
	modifiers: ImagePresetModifier;
}

export const IMAGE_PRESET_DEFINITIONS = {
	// Semantic purpose-driven presets
	placeholder: {
		modifiers: { width: 20 },
	},
	avatar: {
		modifiers: { width: 120, height: 120, quality: 80 },
	},
	thumbnail: {
		modifiers: { width: 240, quality: 50 },
	},
	card: {
		modifiers: { width: 480, quality: 50 },
	},
	portrait: {
		modifiers: { width: 720, quality: 50 },
	},
	editorial: {
		modifiers: { width: 1200, quality: 80, format: "jpeg" },
	},
	hero: {
		modifiers: { width: 1920, quality: 80, format: "webp" },
	},
	fullscreen: {
		modifiers: { width: 2048, quality: 70, format: "webp" },
	},
} as const satisfies Record<string, ImagePresetDefinition>;

export type ImagePreset = keyof typeof IMAGE_PRESET_DEFINITIONS;
export type ImageFormat = "auto" | "webp" | "jpeg" | "png";
