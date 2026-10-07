import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";
import sharp from "sharp";
import { IMAGE_EXTENSIONS } from "../shared/constants";

interface PresetModifier {
	width: number;
	height?: number;
	quality?: number;
}

interface PresetRule {
	patterns: string[];
	presets: string[];
}

const PRESET_RULES: PresetRule[] = [
	{
		patterns: ["**/gallery/**"],
		presets: ["thumbnailXXSm", "thumbnailSm", "thumbnailMd", "thumbnailXLg", "thumbnailXXLg", "thumbnailXXXLg"],
	},
	{
		patterns: ["**/groups/**"],
		presets: ["thumbnailXXSm", "thumbnailSm", "thumbnailLg", "thumbnailXXLg", "thumbnailXXXLg"],
	},
	{
		patterns: ["**/people/**"],
		presets: ["thumbnailXXSm", "thumbnailMd", "thumbnailLg", "thumbnailXXLg"],
	},
	{
		patterns: ["**/promo/**"],
		presets: ["thumbnailXXSm", "thumbnailMd", "thumbnailXLg", "thumbnailXXLg"],
	},
];

const DEFAULT_PRESETS: string[] = ["thumbnailXXSm", "thumbnailMd"];

const PRESET_MAP: Record<string, string> = {
	thumbnailXXSm: "w_20",
	thumbnailSm: "w_240&q_50",
	thumbnailMd: "w_480&q_50",
	thumbnailLg: "w_720&q_50",
	thumbnailXLg: "w_1080&q_50",
	thumbnailXXLg: "w_1920&q_50",
	thumbnailXXXLg: "w_2048&q_70",
};

const PRESET_MODIFIERS: Record<string, PresetModifier> = {
	thumbnailXXSm: { width: 20 },
	thumbnailSm: { width: 240, quality: 50 },
	thumbnailMd: { width: 480, quality: 50 },
	thumbnailLg: { width: 720, quality: 50 },
	thumbnailXLg: { width: 1080, quality: 50 },
	thumbnailXXLg: { width: 1920, quality: 50 },
	thumbnailXXXLg: { width: 2048, quality: 70 },
};

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
	modifier: PresetModifier;
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
	modifier: PresetModifier,
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
			await workerFn(items[currentIndex]);
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

		for (const preset of presets) {
			const ipxSegment = PRESET_MAP[preset];
			const modifier = PRESET_MODIFIERS[preset];
			if (!ipxSegment || !modifier) {
				continue;
			}

			const hash = computeCacheHash(imageRelPath, sourceMtime, modifier, rawExt);
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

				const ext = extname(task.sourcePath).toLowerCase();
				if (ext === ".jpg" || ext === ".jpeg") {
					pipeline = pipeline.jpeg({ quality: task.modifier.quality ?? 80, progressive: true });
				}
				else if (ext === ".png") {
					pipeline = pipeline.png({ quality: task.modifier.quality ?? 80, progressive: true });
				}
				else if (ext === ".webp") {
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
