import { join, resolve } from "path";
import sizeOf from "image-size";
import type { BestvinaImage, MinifiedBestvinaImage } from "#shared/utils/imageMapper";
import { PATHS, IMAGE_EXTENSIONS } from "#shared/constants";
import { readFile, readdir } from "node:fs/promises";

const VALID_EXTENSIONS_REGEX = new RegExp(`\\.(${IMAGE_EXTENSIONS.join("|")})$`, "i");

// TODO: might require further improvement to use async fs
// for now, this fixes the EMFILE (too many open) during prerender

/**
 * Logic to determine group titles for the 'groups' section.
 */
export const getGroupTitle = (filename: string, year: number): string | null => {
	// TODO: implement group subtype logic

	let field: string | null = null;
	const group: string | null = null; // Placeholder for future C1/B2 logic
	const lowerFile = filename.toLowerCase();

	if (year < 2024) {
		if (lowerFile.includes("ch")) field = "Chemie";
		else if (lowerFile.includes("bi")) field = "Biologie";
	}

	// TODO: implement logic for further years
	if (year === 2024) return null;

	if (field && group) return `${field} ${group}`;
	if (field) return field;

	return null;
};

type AuthorExtractor = (filename: string) => string | undefined;

const authorExtractors: Array<{ fromYear: number; toYear: number; extract: AuthorExtractor }> = [
	{
		fromYear: 2010,
		toYear: 2023,
		extract: filename => filename.split("-")[3],
	},
	{
		fromYear: 2024,
		toYear: 2024,
		extract: filename => filename.split("__")?.at(2)?.split("_")?.at(0)?.split(".")[0]?.toLowerCase(),
	},
];

/**
 * Extracts author shortcut based on year-specific naming conventions.
 */
export const extractAuthorShortcut = (filename: string, year: number): string => {
	const strategy = authorExtractors.find(e => year >= e.fromYear && year <= e.toYear);
	const foundShortcut = strategy?.extract(filename);

	const authorExists = IMAGE_AUTHORS.some(a => a.shortcut === foundShortcut);
	return authorExists && foundShortcut ? foundShortcut : "unknown";
};

/**
 * Reads a single image file and prepares the BestvinaImage object.
 */
export const processImageFile = async (
	baseDir: string,
	file: string,
	year: string,
	type: string,
): Promise<MinifiedBestvinaImage> => {
	const filePath = join(baseDir, file);
	const numericYear = Number(year);

	// Read into Buffer for image-size v2.0 compatibility
	const buffer = await readFile(filePath);
	const dimensions = sizeOf(buffer);

	const w = dimensions.width || 1;
	const h = dimensions.height || 1;

	// Build the full object using the shared interface
	const fullImage: BestvinaImage = {
		path: PATHS.IMAGE_PATH(year, type, file),
		year: year,
		width: w,
		height: h,
		aspectRatio: Number((w / h).toFixed(2)),
		author: IMAGE_AUTHORS.find(a => a.shortcut === extractAuthorShortcut(file, numericYear)) || null,
		title: type === "groups" ? getGroupTitle(file, numericYear) : null,
	};

	return encodeBestvinaImage(fullImage);
};

/**
 * Orchestrates the reading of an entire directory for a given year and type.
 * Processes files sequentially to avoid file descriptor exhaustion.
 */
export const getImagesForYear = async (year: string, type: string): Promise<MinifiedBestvinaImage[]> => {
	const baseDir = resolve(process.cwd(), "public", "imgs", "years", year, type);

	try {
		const files = await readdir(baseDir);
		const validFiles = files.filter(file => VALID_EXTENSIONS_REGEX.test(file));

		// Process files sequentially to avoid EMFILE errors
		const results: MinifiedBestvinaImage[] = [];
		for (const file of validFiles) {
			const result = await processImageFile(baseDir, file, year, type);
			results.push(result);
		}

		return results;
	}
	catch (error: any) {
		// If directory doesn't exist, return empty array (safe fallback for empty years)
		if (error.code === "ENOENT") {
			return [];
		}
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to read images for year ${year}: ${error.message}`,
		});
	}
};
