import { computed, type MaybeRefOrGetter, ref, toValue, watchEffect } from "vue";
import { type BestvinaImage, decodeBestvinaImage, type MinifiedBestvinaImage } from "#shared/utils/imageMapper";

/**
 * Represents the response structure of an API that returns images grouped by keys.
 * Each key in the `images` object corresponds to a collection of `MinifiedBestvinaImage` objects.
 *
 * @interface ImagesApiResponse
 * @property {Record<string, MinifiedBestvinaImage[]>} images - A record where the key is a string identifier
 * and the value is an array of `MinifiedBestvinaImage` objects representing the minified images.
 */
interface ImagesApiResponse {
	images: Record<string, MinifiedBestvinaImage[]>;
}

/**
 * Represents the structure of the response object returned by an API that provides a list of years.
 *
 * The `YearsApiResponse` interface contains a single property:
 * - `years`: An array of strings, where each string represents a year (e.g., "2023").
 */
interface YearsApiResponse {
	years: YearApiResponse[];
}

interface YearApiResponse {
	year: string;
	galleryImagesCount: number;
	groupImagesCount: number;
}

interface BestvinaImagesOptions {
	enableUrlSync?: boolean;
}

/**
 * Provides functionality to fetch and manage images for a specific category ("gallery" or "groups") based on user-specified filters like years and authors.
 * This composable fetches images from an API, processes, and organizes them for easy retrieval and filtering.
 *
 * @param {string} type - The category of the images. Should be either "gallery" or "groups".
 * @param {MaybeRefOrGetter<string | string[]>} [requestedYears] - An optional ref or getter containing the target years to fetch images for. Can be a single year or an array of years.
 * @param options
 * @returns A reactive state object containing references to manage and retrieve images:
 * - `groupedImages` {Ref<Record<string, BestvinaImage[]>>} - Reactive cache storing images grouped by year.
 * - `allAvailableYears` {Ref<string[]>} - Reactive reference containing all available years fetched from the API.
 * - `pending` {Ref<boolean>} - Reactive reference indicating whether an API request is currently being processed.
 * - `error` {Ref<Error | null>} - Reactive reference containing any error encountered during API requests.
 * - `selectedYears` {Ref<string[]>} - Reactive reference for managing the currently selected years for filtering images.
 * - `selectedAuthors` {Ref<string[]>} - Reactive reference for managing the currently selected authors for filtering images.
 * - `filteredImages` {ComputedRef<BestvinaImage[]>} - A computed reference that returns a flattened list of images filtered by the selected years and authors.
 * - `filteredGroupedImages` {ComputedRef<Record<string, BestvinaImage[]>>} - A computed reference that returns images grouped by year and filtered by the selected years and authors.
 * - `availableAuthors` {ComputedRef<Photographer[]>} - A computed reference that returns a list of unique authors extracted from the currently available images.
 * - `getRandomImages` {function} - A function to retrieve a specified number of random images from the filtered images.
 */
export const useBestvinaImages = (
	type: "gallery" | "groups",
	requestedYears?: MaybeRefOrGetter<string | string[]>,
	options: BestvinaImagesOptions = { enableUrlSync: false },
) => {
	const route = useRoute();
	const router = useRouter();
	const { enableUrlSync = false } = options;

	const parseCommaQuery = (param: string | string[] | undefined | null): string[] => {
		if (!param) return [];
		const paramString = Array.isArray(param) ? param[0] : param;
		return paramString?.split(",").filter(Boolean) || [];
	};

	// Initialize refs from URL if sync is enabled, otherwise default to empty arrays
	const selectedYears = ref<string[]>(
		enableUrlSync ? parseCommaQuery(route.query.y as string | string[] | undefined) : [],
	);
	const selectedAuthors = ref<string[]>(
		enableUrlSync ? parseCommaQuery(route.query.a as string | string[] | undefined) : [],
	);

	const pending = ref(true);
	const error = ref<Error | null>(null);
	const yearsLoaded = ref(false);

	const groupedImages = useState<Record<string, BestvinaImage[]>>(
		`images-${type}-cache`,
		() => shallowRef({}),
	);

	const allAvailableYears = ref<YearApiResponse[]>([]);

	const targetYearsArray = computed(() => {
		if (!requestedYears) return [];
		const val = toValue(requestedYears);
		if (!val) return [];
		return Array.isArray(val) ? val : [val];
	});

	const fetchYears = async () => {
		if (yearsLoaded.value)
			return;

		try {
			const data = await $fetch<YearsApiResponse>("/api/v1/images/years");
			allAvailableYears.value = data?.years || [];
		}
		catch (err) {
			console.error("Failed to fetch years:", err);
			error.value = err instanceof Error ? err : new Error("Failed to fetch years");
			allAvailableYears.value = [];
		}
		finally {
			yearsLoaded.value = true;
		}
	};

	const fetchImages = async () => {
		pending.value = true;
		try {
			const yearsToFetch = targetYearsArray.value.length > 0
				? targetYearsArray.value
				: allAvailableYears.value.map(item => item.year);

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
			error.value = null;
		}
		catch (err) {
			console.error("Failed to fetch images: ", err);
			error.value = err instanceof Error ? err : new Error("Failed to fetch images");
		}
		finally {
			pending.value = false;
		}
	};

	const filteredImages = computed(() => {
		let flatList: BestvinaImage[] = [];
		for (const [year, images] of Object.entries(groupedImages.value)) {
			if (selectedYears.value.length > 0 && !selectedYears.value.includes(year)) continue;
			flatList.push(...images);
		}
		if (selectedAuthors.value.length > 0) {
			flatList = flatList.filter(img => img.author && selectedAuthors.value.includes(img.author.shortcut));
		}
		return flatList;
	});

	const filteredGroupedImages = computed(() => {
		const result: Record<string, BestvinaImage[]> = {};
		const authorsToFilter = selectedAuthors.value.map(a => String(a).trim());
		const yearsToFilter = selectedYears.value.map(y => String(y).trim());

		for (const [year, images] of Object.entries(groupedImages.value)) {
			if (yearsToFilter.length > 0 && !yearsToFilter.includes(String(year).trim())) {
				continue;
			}
			const yearFilteredImages = authorsToFilter.length > 0
				? images.filter(img => img.author && authorsToFilter.includes(img.author.shortcut))
				: images;

			if (yearFilteredImages.length > 0) {
				result[year] = yearFilteredImages;
			}
		}
		return result;
	});

	const availableAuthors = computed(() => {
		const authorsMap = new Map<string, Photographer>();
		Object.values(groupedImages.value).flat().forEach((img) => {
			if (img.author) authorsMap.set(img.author.shortcut, img.author);
		});
		return Array.from(authorsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	});

	const availableYears = computed(() => {
		return allAvailableYears.value
			.filter(item => item.galleryImagesCount != 0)
			.map(item => item.year);
	});

	const getRandomImages = (n: number) => {
		if (filteredImages.value.length === 0) return [];
		const shuffled = shuffle([...filteredImages.value], false);
		return shuffled.slice(0, n);
	};

	fetchYears();

	watchEffect(() => {
		if (yearsLoaded.value && (targetYearsArray.value.length > 0 || allAvailableYears.value.length > 0)) {
			fetchImages();
		}
	});

	if (enableUrlSync) {
		watch(
			[selectedAuthors, selectedYears],
			([newAuthors, newYears]) => {
				router.replace({
					query: {
						...route.query,
						a: newAuthors.length > 0 ? newAuthors.join(",") : undefined,
						y: newYears.length > 0 ? newYears.join(",") : undefined,
					},
				});
			},
			{ deep: true },
		);
	}

	return {
		groupedImages,
		allAvailableYears,
		pending,
		error,
		selectedYears,
		selectedAuthors,
		filteredImages,
		filteredGroupedImages,
		availableAuthors,
		availableYears,
		getRandomImages,
	};
};
