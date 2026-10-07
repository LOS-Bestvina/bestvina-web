import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";
import sharp from "sharp";
import { IMAGE_EXTENSIONS } from "../shared/constants";
import {
	IMAGE_PRESET_DEFINITIONS,
	type ImagePreset,
	type ImagePresetModifier,
} from "../shared/constants/imagePresets";

interface PresetRule {
	patterns: string[];
	presets: ImagePreset[];
}

const PRESET_RULES: PresetRule[] = [
	{
		patterns: ["**/gallery/**"],
		presets: ["placeholder", "thumbnail", "card", "editorial", "hero", "fullscreen"],
	},
	{
		patterns: ["**/groups/**"],
		presets: ["placeholder", "thumbnail", "portrait", "hero", "fullscreen"],
	},
	{
		patterns: ["**/people/**"],
		presets: ["placeholder", "avatar", "card", "portrait", "hero"],
	},
	{
		patterns: ["**/promo/**"],
		presets: ["placeholder", "card", "editorial", "hero"],
	},
];

const DEFAULT_PRESETS: ImagePreset[] = ["placeholder", "card"];

function toIpxSegment(modifier: ImagePresetModifier): string {
	const parts: string[] = [];
	if (modifier.width) parts.push(`w_${modifier.width}`);
	if (modifier.height) parts.push(`h_${modifier.height}`);
	if (modifier.quality) parts.push(`q_${modifier.quality}`);
	if (modifier.format) parts.push(`f_${modifier.format}`);
	return parts.join("&");
}

const PRESET_MODIFIERS: Record<string, ImagePresetModifier> = Object.fromEntries(
	Object.entries(IMAGE_PRESET_DEFINITIONS).map(([key, def]) => [key, def.modifiers]),
);

const PRESET_MAP: Record<string, string> = Object.fromEntries(
	Object.entries(IMAGE_PRESET_DEFINITIONS).map(([key, def]) => [key, toIpxSegment(def.modifiers)]),
);

function patternToRegex(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const regexString = escaped
		.replace(/\*\*/g, ".+")
		.replace(/\*/g, "[^/]+");
	return new RegExp(`^${regexString}$`);
}

interface ImageTask {
	sourcePath: string;
	relPath: string;
	sourceMtime: number;
	preset: string;
	ipxSegment: string;
	modifier: ImagePresetModifier;
	cacheFilePath: string;
	targetOutputPath: string;
}

async function getAllImages(dir: string): Promise<string[]> {
	const entries = await readdir(resolve(dir), { withFileTypes: true, recursive: true });
	const images: string[] = [];
	const publicDir = resolve("public");

	for (const entry of entries) {
		const ext = entry.name.substring(entry.name.lastIndexOf(".") + 1).toLowerCase();
		if (entry.isFile() && IMAGE_EXTENSIONS.includes(ext)) {
			const posixPathWithoutPublic = relative(publicDir, entry.parentPath).replace(/\\/g, "/");
			images.push(`${posixPathWithoutPublic}/${entry.name}`);
		}
	}

	return images;
}

function computeCacheHash(
	relPath: string,
	sourceModificationTime: number,
	modifier: ImagePresetModifier,
	format: string,
): string {
	const hashPayload = `${relPath}:${sourceModificationTime}:${modifier.width}:${modifier.height ?? ""}:${modifier.quality ?? ""}:${format}`;
	return createHash("md5").update(hashPayload).digest("hex");
}

async function runWithConcurrency<T>(
	items: T[],
	concurrencyLimit: number,
	workerFn: (item: T) => Promise<void>,
): Promise<void> {
	let index = 0;
	const workers = Array.from({ length: Math.min(concurrencyLimit, items.length) }, async () => {
		while (index < items.length) {
			const currentIndex = index++;
			const item = items[currentIndex];
			if (item !== undefined) {
				await workerFn(item);
			}
		}
	});

	await Promise.all(workers);
}

export async function generateThumbnails(options: {
	sourceDir?: string;
	cacheDir?: string;
	outputDir?: string;
	concurrency?: number;
} = {}): Promise<void> {
	const startTime = Date.now();
	const sourceDir = options.sourceDir ?? "public/imgs";
	const cacheDir = resolve(options.cacheDir ?? ".cache/thumbnails");
	const outputDir = resolve(options.outputDir ?? ".output/public/_ipx");
	const concurrency = options.concurrency ?? (availableParallelism ? availableParallelism() : 8);

	await mkdir(cacheDir, { recursive: true });

	const images = await getAllImages(sourceDir);
	console.log(`[generateThumbnails] Discovered ${images.length} source images in ${sourceDir}`);

	const compiledRules = PRESET_RULES.map(rule => ({
		regexes: rule.patterns.map(patternToRegex),
		presets: rule.presets,
	}));

	const tasks: ImageTask[] = [];

	for (const imageRelPath of images) {
		const fullSourcePath = resolve("public", imageRelPath);
		const fileStat = await stat(fullSourcePath);
		const sourceMtime = Math.round(fileStat.mtimeMs);
		const ext = extname(imageRelPath).toLowerCase();
		const rawExt = ext.replace(/^\./, "");

		const matchingRule = compiledRules.find(rule =>
			rule.regexes.some(regex => regex.test(imageRelPath)),
		);

		const presets = matchingRule ? matchingRule.presets : DEFAULT_PRESETS;

		const seenSegments = new Set<string>();
		for (const preset of presets) {
			const ipxSegment = PRESET_MAP[preset];
			const modifier = PRESET_MODIFIERS[preset];
			if (!ipxSegment || !modifier || seenSegments.has(ipxSegment)) {
				continue;
			}
			seenSegments.add(ipxSegment);

			const hash = computeCacheHash(imageRelPath, sourceMtime, modifier, modifier.format ?? rawExt);
			const cacheFilePath = join(cacheDir, `${hash}${ext}`);
			const targetOutputPath = join(outputDir, ipxSegment, imageRelPath);

			tasks.push({
				sourcePath: fullSourcePath,
				relPath: imageRelPath,
				sourceMtime,
				preset,
				ipxSegment,
				modifier,
				cacheFilePath,
				targetOutputPath,
			});
		}
	}

	console.log(`[generateThumbnails] Prepared ${tasks.length} thumbnail tasks with concurrency ${concurrency}`);

	let cacheHits = 0;
	let sharpProcessed = 0;
	const missingTasks: ImageTask[] = [];

	for (const task of tasks) {
		if (existsSync(task.cacheFilePath)) {
			cacheHits++;
		}
		else {
			missingTasks.push(task);
		}
	}

	console.log(`[generateThumbnails] Cache hits: ${cacheHits}, to generate: ${missingTasks.length}`);

	if (missingTasks.length > 0) {
		await runWithConcurrency(missingTasks, concurrency, async (task) => {
			try {
				let pipeline = sharp(task.sourcePath)
					.rotate()
					.resize({
						width: task.modifier.width,
						height: task.modifier.height,
						withoutEnlargement: true,
					});

				const targetFormat = task.modifier.format ?? extname(task.sourcePath).toLowerCase().replace(/^\./, "");
				if (targetFormat === "jpg" || targetFormat === "jpeg") {
					pipeline = pipeline.jpeg({ quality: task.modifier.quality ?? 80, progressive: true });
				}
				else if (targetFormat === "png") {
					pipeline = pipeline.png({ quality: task.modifier.quality ?? 80, progressive: true });
				}
				else if (targetFormat === "webp") {
					pipeline = pipeline.webp({ quality: task.modifier.quality ?? 80 });
				}

				await pipeline.toFile(task.cacheFilePath);
				sharpProcessed++;
			}
			catch (error) {
				console.error(`[generateThumbnails] Failed to resize ${task.relPath} (${task.preset}):`, error);
			}
		});
	}

	console.log(`[generateThumbnails] Mirroring ${tasks.length} thumbnails to ${outputDir}...`);

	let copiedCount = 0;
	await runWithConcurrency(tasks, concurrency * 2, async (task) => {
		if (!existsSync(task.cacheFilePath)) {
			return;
		}

		await mkdir(dirname(task.targetOutputPath), { recursive: true });
		await copyFile(task.cacheFilePath, task.targetOutputPath);
		copiedCount++;
	});

	const duration = ((Date.now() - startTime) / 1000).toFixed(2);
	console.log(`[generateThumbnails] Completed in ${duration}s. Hits: ${cacheHits}, Generated: ${sharpProcessed}, Copied: ${copiedCount}`);
}

// Execute directly if run as a script
const isMain = Boolean(process.argv[1] && (
	import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`
		|| process.argv[1].endsWith("generateThumbnails.ts")
));

if (isMain) {
	generateThumbnails().catch((err) => {
		console.error("[generateThumbnails] Fatal error:", err);
		process.exit(1);
	});
}
