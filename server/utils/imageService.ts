import { join, resolve } from "path";
import sizeOf from "image-size";
import type { BestvinaImage, MinifiedBestvinaImage } from "#shared/utils/imageMapper";
import { IMAGE_EXTENSIONS, PATHS } from "#shared/constants";
import { readdir, readFile } from "node:fs/promises";
import { IMAGE_AUTHORS } from "#shared/utils/photographers";

const VALID_EXTENSIONS_REGEX = new RegExp(`\\.(${IMAGE_EXTENSIONS.join("|")})$`, "i");

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
		toYear: 2025,
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
 * Extracts capture date and original dimensions from EXIF metadata.
 */
export const extractExifMetadata = (buf: Buffer): { date: string | null; width?: number; height?: number } => {
	const result: { date: string | null; width?: number; height?: number } = { date: null };
	if (!buf || buf.length < 32) return result;

	let app1Offset = -1;
	let i = 2;
	while (i < buf.length - 4) {
		if (buf[i] === 0xFF && buf[i + 1] === 0xE1) {
			app1Offset = i;
			break;
		}
		if (buf[i] === 0xFF && (buf[i + 1] === 0xDA || buf[i + 1] === 0xD9)) break;
		if (buf[i] === 0xFF && buf[i + 1] !== 0x00) {
			const len = buf.readUInt16BE(i + 2);
			i += 2 + len;
		}
		else {
			i++;
		}
	}

	if (app1Offset === -1) return result;
	const app1Len = buf.readUInt16BE(app1Offset + 2);
	const app1End = app1Offset + 2 + app1Len;
	if (app1End > buf.length || buf.toString("ascii", app1Offset + 4, app1Offset + 10) !== "Exif\0\0") return result;

	const tiffOffset = app1Offset + 10;
	const isLittle = buf.toString("ascii", tiffOffset, tiffOffset + 2) === "II";
	const readU16 = (o: number) => isLittle ? buf.readUInt16LE(tiffOffset + o) : buf.readUInt16BE(tiffOffset + o);
	const readU32 = (o: number) => isLittle ? buf.readUInt32LE(tiffOffset + o) : buf.readUInt32BE(tiffOffset + o);
	const readTagValue = (o: number, t: number) => t === 3 ? readU16(o) : readU32(o);

	if (readU16(2) !== 42) return result;
	const firstIfdOffset = readU32(4);

	const readIfd = (ifdOffset: number) => {
		if (ifdOffset <= 0 || tiffOffset + ifdOffset + 2 > app1End) return;
		const numEntries = readU16(ifdOffset);
		let entryOffset = ifdOffset + 2;

		for (let e = 0; e < numEntries; e++) {
			if (tiffOffset + entryOffset + 12 > app1End) break;
			const tag = readU16(entryOffset);
			const type = readU16(entryOffset + 2);
			const count = readU32(entryOffset + 4);

			// Date tags: 0x9003 DateTimeOriginal, 0x9004 DateTimeDigitized
			if ((tag === 0x9003 || tag === 0x9004) && type === 2 && count >= 19) {
				const valOffset = count <= 4 ? entryOffset + 8 : readU32(entryOffset + 8);
				if (tiffOffset + valOffset + 19 <= app1End) {
					const str = buf.toString("ascii", tiffOffset + valOffset, tiffOffset + valOffset + 19);
					const m = str.match(/^(\d{4}):(\d{2}):(\d{2})/);
					if (m) {
						const [, yearStr, monthStr, dayStr] = m;
						if (yearStr && monthStr && dayStr && (tag === 0x9003 || !result.date)) {
							result.date = `${Number(dayStr)}. ${Number(monthStr)}. ${yearStr}`;
						}
					}
				}
			}

			// Original dimension tags: 0xa002 PixelXDimension, 0xa003 PixelYDimension
			if (tag === 0xa002 && (type === 3 || type === 4)) {
				result.width = readTagValue(entryOffset + 8, type);
			}
			if (tag === 0xa003 && (type === 3 || type === 4)) {
				result.height = readTagValue(entryOffset + 8, type);
			}

			if (tag === 0x8769) {
				const subIfdOffset = readU32(entryOffset + 8);
				readIfd(subIfdOffset);
			}
			entryOffset += 12;
		}
	};

	readIfd(firstIfdOffset);
	return result;
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
	const exif = extractExifMetadata(buffer);

	// Use original image dimensions (from EXIF if available, otherwise source file dimensions)
	const hasExifDimensions = Boolean(exif.width && exif.height);
	const w = (hasExifDimensions ? exif.width : dimensions.width) || 1;
	const h = (hasExifDimensions ? exif.height : dimensions.height) || 1;

	// Build the full object using the shared interface
	const fullImage: BestvinaImage = {
		path: PATHS.IMAGE_PATH(year, type, file),
		year: year,
		width: w,
		height: h,
		aspectRatio: Number((w / h).toFixed(2)),
		author: IMAGE_AUTHORS.find(a => a.shortcut === extractAuthorShortcut(file, numericYear)) || null,
		title: type === "groups" ? getGroupTitle(file, numericYear) : null,
		filesize: buffer.byteLength,
		date: exif.date,
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
	catch (error: unknown) {
		const nodeError = error as NodeJS.ErrnoException;
		// If directory doesn't exist, return empty array (safe fallback for empty years)
		if (nodeError?.code === "ENOENT") {
			return [];
		}
		const message = error instanceof Error ? error.message : String(error);
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to read images for year ${year}: ${message}`,
			cause: error,
		});
	}
};

/**
 * Reads an entire directory for a given year and type and returns the count of valid image files.
 */
export const getImageCountForYear = async (year: string, type: string): Promise<number> => {
	const dir = resolve(process.cwd(), "public", "imgs", "years", year, type);
	try {
		const files = await readdir(dir);
		return files.filter(f => VALID_EXTENSIONS_REGEX.test(f)).length;
	}
	catch {
		return 0;
	}
};
