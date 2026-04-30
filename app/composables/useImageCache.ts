import { decodeBestvinaImage } from "#shared/utils/imageMapper";
import type { BestvinaImage, MinifiedBestvinaImage } from "#shared/utils/imageMapper";

export interface ImagesApiResponse {
	images: Record<string, MinifiedBestvinaImage[]>;
}

export function useImageCache(type: "gallery" | "groups") {
	const pending = ref(true);
	const fetchImagesError = ref<Error | null>(null);
	const groupedImages = useState<Record<string, BestvinaImage[]>>(
		`images-${type}-cache`,
		() => shallowRef({}),
	);

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

	return { groupedImages, pending, fetchImagesError, fetchImages };
}
