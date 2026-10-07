/// <reference types="@types/bun" />
import { describe, expect, it } from "bun:test";
import { IMAGE_PRESET_DEFINITIONS, type ImagePreset, type ImageFormat } from "../shared/constants/imagePresets";

describe("AppImage specification & preset resolution", () => {

	it("allows overriding preset format with explicit format prop", () => {
		const resolveFormat = (propFormat?: ImageFormat, preset?: ImagePreset) => {
			if (propFormat && propFormat !== "auto") return propFormat;
			if (preset && IMAGE_PRESET_DEFINITIONS[preset]?.modifiers.format) {
				return IMAGE_PRESET_DEFINITIONS[preset].modifiers.format;
			}
			return undefined;
		};

		// Default editorial uses jpeg
		expect(resolveFormat(undefined, "editorial")).toBe("jpeg");
		// Explicit webp overrides editorial's default jpeg
		expect(resolveFormat("webp", "editorial")).toBe("webp");
		// Explicit auto falls back to undefined for browser negotiation
		expect(resolveFormat("auto", "card")).toBeUndefined();
	});

	it("derives eager loading and high fetchpriority when priority is true", () => {
		const resolveLoading = (loading?: "lazy" | "eager", priority?: boolean) => {
			if (loading) return loading;
			return priority ? "eager" : "lazy";
		};

		const resolveFetchPriority = (fetchpriority?: "high" | "low" | "auto", priority?: boolean) => {
			if (fetchpriority) return fetchpriority;
			return priority ? "high" : undefined;
		};

		expect(resolveLoading(undefined, true)).toBe("eager");
		expect(resolveFetchPriority(undefined, true)).toBe("high");

		expect(resolveLoading(undefined, false)).toBe("lazy");
		expect(resolveFetchPriority(undefined, false)).toBeUndefined();

		// Explicit overrides take precedence
		expect(resolveLoading("lazy", true)).toBe("lazy");
		expect(resolveFetchPriority("low", true)).toBe("low");
	});
});
