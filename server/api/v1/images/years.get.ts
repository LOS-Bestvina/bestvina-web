import { resolve } from "path";
import { readdir } from "node:fs/promises";
import { getImageCountForYear } from "~~/server/utils/imageService";

export default defineEventHandler(async () => {
	const baseDir = resolve(process.cwd(), "public", "imgs", "years");

	try {
		const entries = await readdir(baseDir, { withFileTypes: true });

		const years = entries
			.filter(entry => entry.isDirectory() && entry.name.match(/^\d{4}$/))
			.map(entry => entry.name)
			.sort((a, b) => Number(b) - Number(a)); // Sort newest first

		// Process years sequentially to avoid resource exhaustion
		const response = [];
		for (const year of years) {
			const [galleryImageCount, groupsImageCount] = await Promise.all([
				getImageCountForYear(year, "gallery"),
				getImageCountForYear(year, "groups"),
			]);

			response.push({
				year: year,
				galleryImagesCount: galleryImageCount,
				groupsImagesCount: groupsImageCount,
			});
		}

		return { years: response };
	}
	catch (error) {
		console.error("Failed to read images directory", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to read images directory.",
		});
	}
});
