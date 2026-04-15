import type { BestvinaImage } from "#shared/utils/imageMapper";
import type { YearApiResponse } from "./useImageYears";

export function useImageFilters(
	groupedImages: Ref<Record<string, BestvinaImage[]>>,
	allAvailableYears: Ref<YearApiResponse[]>,
	selectedYears: Ref<string[]>,
	selectedAuthors: Ref<string[]>
) {
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
		const authorsMap = new Map<string, unknown>();
		Object.values(groupedImages.value).flat().forEach((img) => {
			if (img.author) authorsMap.set(img.author.shortcut, img.author);
		});
		// @ts-expect-error unresolved author name object types
		return Array.from(authorsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	});

	const availableYears = computed(() => {
		return allAvailableYears.value
			.filter(item => item.galleryImagesCount !== 0)
			.map(item => item.year);
	});

	const getRandomImages = (n: number) => {
		if (filteredImages.value.length === 0) return [];
		const shuffled = shuffle([...filteredImages.value], false);
		return shuffled.slice(0, n);
	};

	return { filteredImages, filteredGroupedImages, availableAuthors, availableYears, getRandomImages };
}
