import type { MinifiedBestvinaImage } from "#shared/utils/imageMapper";
import { IMAGE_TYPES, ImageType } from "#shared/types";

export default defineEventHandler(async (event) => {
	const type = getRouterParam(event, "type") as ImageType;
	const year = getRouterParam(event, "year");

	if (!IMAGE_TYPES.includes(type)) {
		throw createError({ statusCode: 400, statusMessage: "Invalid type parameter" });
	}

	if (!year || !year.match(/^\d{4}$/)) {
		throw createError({ statusCode: 400, statusMessage: "Invalid year parameter" });
	}

	const images = await getImagesForYear(year, type);

	const result: Record<string, MinifiedBestvinaImage[]> = {
		[year]: images,
	};

	return { images: result };
});
