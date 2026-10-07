/// <reference types="@types/bun" />
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "bun:test";

describe("accessibility compliance (WCAG & best practices)", () => {
	const rootDir = resolve(import.meta.dir, "..");
	const appDir = resolve(rootDir, "app");

	function getAllVueFiles(dir: string): string[] {
		const results: string[] = [];
		const entries = readdirSync(dir);
		for (const entry of entries) {
			const fullPath = join(dir, entry);
			const stat = statSync(fullPath);
			if (stat.isDirectory()) {
				results.push(...getAllVueFiles(fullPath));
			} else if (entry.endsWith(".vue")) {
				results.push(fullPath);
			}
		}
		return results;
	}

	it("ensures all <img> and <NuxtImg> tags in app have an alt or :alt attribute", () => {
		const vueFiles = getAllVueFiles(appDir);
		const missingAlts: { file: string; tag: string }[] = [];

		// match <img> or <NuxtImg> elements
		const imgTagRegex = /<(?:NuxtImg|img)\b([^>]*?)(\/?>)/gs;

		for (const file of vueFiles) {
			const content = readFileSync(file, "utf-8");
			let match: RegExpExecArray | null;
			while ((match = imgTagRegex.exec(content)) !== null) {
				const attributes = match[1];
				const hasAlt = attributes.includes("alt=") || attributes.includes(":alt=");
				if (!hasAlt) {
					const relativePath = file.replace(rootDir, "").replace(/^[\\/]/, "");
					missingAlts.push({
						file: relativePath,
						tag: match[0].slice(0, 100).replace(/\s+/g, " "),
					});
				}
			}
		}

		expect(missingAlts).toEqual([]);
	});

	it("ensures no elements use positive tabindex (which disrupts natural focus order)", () => {
		const vueFiles = getAllVueFiles(appDir);
		const positiveTabindexes: { file: string; snippet: string }[] = [];

		// match elements with positive tabindex
		const positiveTabindexRegex = /tabindex=["']\s*[1-9]\d*\s*["']/g;

		for (const file of vueFiles) {
			const content = readFileSync(file, "utf-8");
			let match: RegExpExecArray | null;
			while ((match = positiveTabindexRegex.exec(content)) !== null) {
				const relativePath = file.replace(rootDir, "").replace(/^[\\/]/, "");
				positiveTabindexes.push({
					file: relativePath,
					snippet: match[0],
				});
			}
		}

		expect(positiveTabindexes).toEqual([]);
	});

	it("ensures layouts contain skip link and main-content anchor with tabindex='-1'", () => {
		const layoutFiles = ["default.vue", "page.vue", "landing.vue"];

		for (const layoutName of layoutFiles) {
			const layoutPath = join(appDir, "layouts", layoutName);
			const content = readFileSync(layoutPath, "utf-8");

			const hasSkipLink = content.includes("<AppSkipLink") || content.includes('href="#main-content"');
			const hasMainTarget = content.includes('id="main-content"') && content.includes('tabindex="-1"');

			expect(hasSkipLink).toBe(true);
			expect(hasMainTarget).toBe(true);
		}
	});

	it("ensures text-justify is not used across Vue templates (WCAG 1.4.8 dyslexia readability)", () => {
		const vueFiles = getAllVueFiles(appDir);
		const filesWithTextJustify: string[] = [];

		for (const file of vueFiles) {
			const content = readFileSync(file, "utf-8");
			// Check for text-justify class inside template
			if (/\btext-justify\b/.test(content)) {
				const relativePath = file.replace(rootDir, "").replace(/^[\\/]/, "");
				filesWithTextJustify.push(relativePath);
			}
		}

		expect(filesWithTextJustify).toEqual([]);
	});

	it("ensures prefers-reduced-motion CSS sets scroll-behavior: auto and avoids !important", () => {
		const cssPath = join(appDir, "assets", "css", "main.css");
		const content = readFileSync(cssPath, "utf-8");

		const reducedMotionMatch = content.match(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([^}]+)\}/);
		expect(reducedMotionMatch).not.toBeNull();

		if (reducedMotionMatch) {
			const block = reducedMotionMatch[1];
			expect(block).toContain("scroll-behavior: auto");
			expect(block).not.toContain("!important");
		}
	});

	it("ensures JustifiedImageLayout image items are keyboard accessible with role and keydown handlers", () => {
		const componentPath = join(appDir, "components", "JustifiedImageLayout.vue");
		const content = readFileSync(componentPath, "utf-8");

		expect(content).toContain('role="button"');
		expect(content).toContain('tabindex="0"');
		expect(content).toContain("aria-label");
		expect(content).toContain("@keydown.enter");
		expect(content).toContain("@keydown.space.prevent");
		expect(content).toContain("focus-visible:");
	});
});
