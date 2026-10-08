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

	it("resolves placeholder automatically from src unless explicitly disabled", () => {
		const mockImg = (src: string, _modifiers: Record<string, unknown>, opts: { preset?: string }) =>
			`/_ipx/${opts.preset}/${src}`;

		const resolvePlaceholder = (placeholder?: string | boolean, src?: string) => {
			if (placeholder === false) return undefined;
			if (typeof placeholder === "string") return placeholder;
			if (src) {
				return mockImg(src, {}, { preset: "placeholder" });
			}
			return undefined;
		};

		// Default: auto-derives from src using placeholder preset
		expect(resolvePlaceholder(undefined, "/test.jpg")).toBe("/_ipx/placeholder//test.jpg");
		expect(resolvePlaceholder(true, "/test.jpg")).toBe("/_ipx/placeholder//test.jpg");

		// Disabled with false
		expect(resolvePlaceholder(false, "/test.jpg")).toBeUndefined();

		// Custom placeholder string
		expect(resolvePlaceholder("data:image/svg+xml,...", "/test.jpg")).toBe("data:image/svg+xml,...");

		// Missing src
		expect(resolvePlaceholder(undefined, undefined)).toBeUndefined();
	});
});
