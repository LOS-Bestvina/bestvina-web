/// <reference types="@types/bun" />
import { describe, expect, it } from "bun:test";
import { IMAGE_PRESET_DEFINITIONS } from "../shared/constants/imagePresets";

describe("IMAGE_PRESET_DEFINITIONS", () => {
	it("defines semantic presets with correct dimensions and formats", () => {
		expect(IMAGE_PRESET_DEFINITIONS.placeholder.modifiers.width).toBe(20);

		expect(IMAGE_PRESET_DEFINITIONS.avatar.modifiers.width).toBe(120);
		expect(IMAGE_PRESET_DEFINITIONS.avatar.modifiers.height).toBe(120);
		expect(IMAGE_PRESET_DEFINITIONS.avatar.modifiers.quality).toBe(80);

		expect(IMAGE_PRESET_DEFINITIONS.thumbnail.modifiers.width).toBe(240);
		expect(IMAGE_PRESET_DEFINITIONS.thumbnail.modifiers.quality).toBe(50);

		expect(IMAGE_PRESET_DEFINITIONS.card.modifiers.width).toBe(480);
		expect(IMAGE_PRESET_DEFINITIONS.card.modifiers.quality).toBe(50);

		expect(IMAGE_PRESET_DEFINITIONS.portrait.modifiers.width).toBe(720);
		expect(IMAGE_PRESET_DEFINITIONS.portrait.modifiers.quality).toBe(50);

		expect(IMAGE_PRESET_DEFINITIONS.editorial.modifiers.width).toBe(1200);
		expect(IMAGE_PRESET_DEFINITIONS.editorial.modifiers.format).toBe("jpeg");

		expect(IMAGE_PRESET_DEFINITIONS.hero.modifiers.width).toBe(1920);
		expect(IMAGE_PRESET_DEFINITIONS.hero.modifiers.format).toBe("webp");

		expect(IMAGE_PRESET_DEFINITIONS.fullscreen.modifiers.width).toBe(2048);
		expect(IMAGE_PRESET_DEFINITIONS.fullscreen.modifiers.quality).toBe(70);
		expect(IMAGE_PRESET_DEFINITIONS.fullscreen.modifiers.format).toBe("webp");
	});

	it("exposes only semantic presets without deprecated aliases", () => {
		const presetKeys = Object.keys(IMAGE_PRESET_DEFINITIONS);
		expect(presetKeys).toEqual([
			"placeholder",
			"avatar",
			"thumbnail",
			"card",
			"portrait",
			"editorial",
			"hero",
			"fullscreen",
		]);
	});
});
