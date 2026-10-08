import { decodeBestvinaImage } from "#shared/utils/imageMapper";
import type { BestvinaImage, MinifiedBestvinaImage } from "#shared/utils/imageMapper";

/**
 * Global reactive cache and fetcher for years images.
 *
 * Maintains a cache per image type (`"groups"` or `"gallery"`).
 *
 * @param type - The type of images to manage cache for.
 * @returns Image cache state and fetch helpers:
 * - `groupedImages`: Reactive record mapping year strings to decoded {@link BestvinaImage} arrays.
 * - `pending`: Boolean ref indicating whether a network request is currently active.
 * - `fetchImagesError`: Error ref containing the latest error, or `null`.
 * - `fetchImages`: Batch-fetches missing years and merges decoded images into cache.
 * - `getYearImages`: Ensures images for a single year are in cache and returns them.
 *
 * @example Fetching a single year's images on demand:
 * ```ts
 * const { getYearImages } = useImageCache("groups");
 * const images = await getYearImages("2026");
 * ```
 *
 * @example Batch-fetching multiple years for a gallery view:
 * ```ts
 * const { groupedImages, fetchImages, pending } = useImageCache("groups");
 * await fetchImages(["2023", "2024"]);
 * console.log(groupedImages.value["2024"]);
 * ```
 */
export function useImageCache(type: ImageType) {
	const pending = ref(true);
	const fetchImagesError = ref<Error | null>(null);
	const groupedImages = useState<Record<string, BestvinaImage[]>>(
		`images-${type}-cache`,
		() => shallowRef({}),
	);

	/**
	 * Fetches images for an array of years in parallel.
	 *
	 * Filters out any years already present in `groupedImages` so no redundant
	 * API requests are dispatched. Decodes minified images before saving to state.
	 *
	 * @param yearsToFetch - Array of year strings to request (e.g. `['2023', '2024']`).
	 */
	const fetchImages = async (yearsToFetch: string[]) => {
		pending.value = true;
		try {
			if (yearsToFetch.length === 0) {
				pending.value = false;
				return;
			}

			const missingYears = yearsToFetch.filter(year => !groupedImages.value[year]);
			if (missingYears.length === 0) {
				pending.value = false;
				return;
			}

			const requests = missingYears.map(year =>
				$fetch<ImagesApiResponse>(`/api/v1/images/${type}/${year}`),
			);

			const responses = await Promise.all(requests);
			const formattedImages: Record<string, BestvinaImage[]> = {};

			for (const response of responses) {
				if (response?.images) {
					for (const [year, minifiedImages] of Object.entries(response.images)) {
						formattedImages[year] = minifiedImages.map(decodeBestvinaImage);
					}
				}
			}

			groupedImages.value = { ...groupedImages.value, ...formattedImages };
			fetchImagesError.value = null;
		}
		catch (err) {
			console.error("Failed to fetch images: ", err);
			fetchImagesError.value = err instanceof Error ? err : new Error("Failed to fetch images");
		}
		finally {
			pending.value = false;
		}
	};

	/**
	 * Retrieves cached images for a specific year, or fetches them from the API if not yet present.
	 *
	 * @param year - Year as a string (e.g. `'2024'`).
	 * @returns Array of decoded {@link BestvinaImage} items for that year.
	 */
	const getYearImages = async (year: string): Promise<BestvinaImage[]> => {
		if (!groupedImages.value[year]) {
			await fetchImages([year]);
		}

		return groupedImages.value[year] ?? [];
	}

	return {
		groupedImages,
		pending,
		fetchImagesError,
		fetchImages,
		getYearImages
	};
}
