import { resolve } from "path";
import { readdir } from "node:fs/promises";

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
			const [galleryImages, groupsImages] = await Promise.all([
				getImagesForYear(year, "gallery"),
				getImagesForYear(year, "groups"),
			]);

			response.push({
				year: year,
				galleryImagesCount: galleryImages.length,
				groupsImagesCount: groupsImages.length,
			});
		}

		return { years: response };
	}
	catch (error: any) {
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to read images directory: ${error.message}`,
		});
	}
});
