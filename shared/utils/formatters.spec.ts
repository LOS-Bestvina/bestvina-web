/// <reference types="@types/bun" />
import { describe, expect, it } from "bun:test";
import { formatFileSize, formatResolution } from "./formatters";

describe("formatFileSize", () => {
	it("returns null for missing, zero, or negative byte values", () => {
		expect(formatFileSize(undefined)).toBeNull();
		expect(formatFileSize(null)).toBeNull();
		expect(formatFileSize(0)).toBeNull();
		expect(formatFileSize(-100)).toBeNull();
	});

	it("formats byte values under 1 kB", () => {
		expect(formatFileSize(1)).toBe("1 B");
		expect(formatFileSize(512)).toBe("512 B");
		expect(formatFileSize(1023)).toBe("1023 B");
	});

	it("formats kilobyte values under 1 MB", () => {
		expect(formatFileSize(1024)).toBe("1 kB");
		expect(formatFileSize(860160)).toBe("840 kB");
		expect(formatFileSize(1024 * 1023)).toBe("1023 kB");
	});

	it("formats megabyte values with up to one decimal place", () => {
		expect(formatFileSize(1024 * 1024)).toBe("1 MB");
		expect(formatFileSize(2516582)).toBe("2.4 MB");
		expect(formatFileSize(10 * 1024 * 1024)).toBe("10 MB");
	});
});

describe("formatResolution", () => {
	it("returns null for invalid or missing dimensions", () => {
		expect(formatResolution(undefined, undefined)).toBeNull();
		expect(formatResolution(0, 0)).toBeNull();
		expect(formatResolution(-1920, 1080)).toBeNull();
		expect(formatResolution(1920, 0)).toBeNull();
	});

	it("formats resolution in megapixels", () => {
		expect(formatResolution(1920, 1080)).toBe("2.1 Mpx");
		expect(formatResolution(2048, 1365)).toBe("2.8 Mpx");
		expect(formatResolution(4000, 3000)).toBe("12 Mpx");
		expect(formatResolution(6000, 4000)).toBe("24 Mpx");
		expect(formatResolution(800, 600)).toBe("0.5 Mpx");
	});
});
