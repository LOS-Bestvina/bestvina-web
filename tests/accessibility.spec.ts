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

	it("ensures all <img>, <NuxtImg>, and <AppImage> tags in app have an alt or :alt attribute", () => {
		const vueFiles = getAllVueFiles(appDir);
		const missingAlts: { file: string; tag: string }[] = [];

		// match <img>, <NuxtImg>, or <AppImage> elements
		const imgTagRegex = /<(?:AppImage|NuxtImg|img)\b([^>]*?)(\/?>)/gs;

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
});
