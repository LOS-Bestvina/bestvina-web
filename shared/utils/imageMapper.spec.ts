/// <reference types="@types/bun" />
import { describe, expect, it } from "bun:test";
import assert from "node:assert";
import { decodeBestvinaImage, encodeBestvinaImage, type BestvinaImage, type MinifiedBestvinaImage } from "./imageMapper";
import { IMAGE_AUTHORS } from "./photographers";

describe("imageMapper", () => {
	const knownAuthor = IMAGE_AUTHORS[0]; // { name: "Jakub Ferenčík", shortcut: "jfer" }
	assert(knownAuthor);

	const fullImage: BestvinaImage = {
		path: "/imgs/years/2024/gallery/2024-07-bestvina-042.jpg",
		year: "2024",
		width: 1920,
		height: 1080,
		aspectRatio: 1.78,
		author: knownAuthor,
		title: "Skupinové foto",
		filesize: 2516582,
		date: "2. 7. 2024",
	};

	const minifiedImage: MinifiedBestvinaImage = {
		p: "/imgs/years/2024/gallery/2024-07-bestvina-042.jpg",
		y: "2024",
		w: 1920,
		h: 1080,
		ar: 1.78,
		a: knownAuthor.shortcut,
		t: "Skupinové foto",
		fs: 2516582,
		d: "2. 7. 2024",
	};

	describe("encodeBestvinaImage", () => {
		it("encodes all image properties including filesize and date", () => {
			const encoded = encodeBestvinaImage(fullImage);
			expect(encoded).toEqual(minifiedImage);
		});

		it("falls back to 'unknown' when author is null or shortcut is missing", () => {
			const imageWithoutAuthor: BestvinaImage = {
				...fullImage,
				author: null,
				title: null,
				filesize: undefined,
				date: null,
			};

			const encoded = encodeBestvinaImage(imageWithoutAuthor);
			expect(encoded.a).toBe("unknown");
			expect(encoded.t).toBeNull();
			expect(encoded.fs).toBeUndefined();
			expect(encoded.d).toBeNull();
		});
	});

	describe("decodeBestvinaImage", () => {
		it("decodes all minified properties including filesize and date, and resolves known author", () => {
			const decoded = decodeBestvinaImage(minifiedImage);
			expect(decoded).toEqual(fullImage);
			expect(decoded.author).toEqual(knownAuthor);
		});

		it("resolves author to null for unknown shortcut", () => {
			const unknownMinified: MinifiedBestvinaImage = {
				...minifiedImage,
				a: "non-existent-shortcut",
			};

			const decoded = decodeBestvinaImage(unknownMinified);
			expect(decoded.author).toBeNull();
		});

		it("preserves undefined optional properties like title, filesize, and date", () => {
			const minimalMinified: MinifiedBestvinaImage = {
				p: "/imgs/test.jpg",
				y: "2025",
				w: 800,
				h: 600,
				ar: 1.33,
				a: "unknown",
			};

			const decoded = decodeBestvinaImage(minimalMinified);
			expect(decoded.title).toBeUndefined();
			expect(decoded.filesize).toBeUndefined();
			expect(decoded.date).toBeUndefined();
			expect(decoded.author).toBeNull();
		});
	});

	describe("roundtrip fidelity", () => {
		it("preserves all properties through encode and decode", () => {
			const roundtrip = decodeBestvinaImage(encodeBestvinaImage(fullImage));
			expect(roundtrip).toEqual(fullImage);
		});

		it("preserves images with null author and optional fields", () => {
			const minimalImage: BestvinaImage = {
				path: "/imgs/years/2023/gallery/foto.jpg",
				year: "2023",
				width: 1200,
				height: 800,
				aspectRatio: 1.5,
				author: null,
			};

			const roundtrip = decodeBestvinaImage(encodeBestvinaImage(minimalImage));
			expect(roundtrip).toEqual(minimalImage);
		});
	});
});
