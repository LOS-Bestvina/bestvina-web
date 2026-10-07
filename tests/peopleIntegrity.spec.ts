/// <reference types="@types/bun" />
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "bun:test";
import { parse } from "yaml";

describe("people data integrity", () => {
	const rootDir = resolve(import.meta.dir, "..");
	const individualsDir = resolve(rootDir, "content/people/individuals");
	const structureDir = resolve(rootDir, "content/people/structure");
	const publicDir = resolve(rootDir, "public");

	it("ensures all person images (including overrides) exist in the /public directory", () => {
		const peopleFiles = readdirSync(individualsDir).filter(
			file => file.endsWith(".md") && !file.startsWith("_"),
		);

		const missingImages: string[] = [];

		for (const file of peopleFiles) {
			const content = readFileSync(join(individualsDir, file), "utf-8");

			// extracting properties at the beginning of the file (YAML, between ---)
			const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
			if (!match) continue;

			const data = (parse(match[1]) || {}) as {
				image?: string;
				overrides?: Record<string, { image?: string }>;
			};

			const imagePaths: string[] = [];
			if (data.image && typeof data.image === "string" && data.image.trim()) {
				imagePaths.push(data.image.trim());
			}

			if (data.overrides && typeof data.overrides === "object") {
				for (const override of Object.values(data.overrides)) {
					if (override?.image && typeof override.image === "string" && override.image.trim()) {
						imagePaths.push(override.image.trim());
					}
				}
			}

			for (const img of imagePaths) {
				const relativePublicPath = img.startsWith("/") ? img.slice(1) : img;
				const fullImagePath = join(publicDir, relativePublicPath);
				if (!existsSync(fullImagePath)) {
					missingImages.push(`${file} -> ${img} (expected at ${fullImagePath})`);
				}
			}
		}

		expect(missingImages).toEqual([]);
	});

	it("ensures all people referenced in structure manifests have corresponding markdown files", () => {
		const structureFiles = readdirSync(structureDir).filter(file => file.endsWith(".json"));
		const missingPeople: string[] = [];

		for (const file of structureFiles) {
			const manifest = JSON.parse(readFileSync(join(structureDir, file), "utf-8")) as {
				id?: string;
				sections?: Array<{ id?: string; people?: string[] }>;
			};

			for (const section of manifest.sections || []) {
				for (const personRef of section.people || []) {
					const personId = personRef.includes("/") ? personRef.split("/").pop()! : personRef;
					const mdPath = join(individualsDir, `${personId}.md`);
					if (!existsSync(mdPath)) {
						missingPeople.push(
							`Manifest "${file}" (section: "${section.id}") references missing person "${personRef}" (expected at ${mdPath})`,
						);
					}
				}
			}
		}

		expect(missingPeople).toEqual([]);
	});

	it("ensures there are no defined subsections containing no people", () => {
		const structureFiles = readdirSync(structureDir).filter(file => file.endsWith(".json"));
		const emptySubsections: string[] = [];

		for (const file of structureFiles) {
			const manifest = JSON.parse(readFileSync(join(structureDir, file), "utf-8")) as {
				id?: string;
				sections?: Array<{ id?: string; name?: string; people?: string[] }>;
			};

			for (const section of manifest.sections || []) {
				if (!section.people || section.people.length === 0) {
					emptySubsections.push(
						`Manifest "${file}" defines subsection "${section.id || section.name || "unnamed"}" with 0 people`,
					);
				}
			}
		}

		expect(emptySubsections).toEqual([]);
	});
});

