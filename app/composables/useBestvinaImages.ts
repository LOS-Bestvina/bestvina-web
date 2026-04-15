interface BestvinaImagesOptions {
	enableUrlSync?: boolean;
}

export const useBestvinaImages = (
	type: "gallery" | "groups",
	requestedYears?: MaybeRefOrGetter<string | string[]>,
	options: BestvinaImagesOptions = { enableUrlSync: false },
) => {
	const { enableUrlSync = false } = options;

	const { initialYears, initialAuthors, syncUrl } = useImageUrlSync();

	const selectedYears = ref<string[]>(enableUrlSync ? initialYears : []);
	const selectedAuthors = ref<string[]>(enableUrlSync ? initialAuthors : []);

	const { allAvailableYears, yearsLoaded, fetchYearsError, fetchYears } = useImageYears();
	const { groupedImages, pending, fetchImagesError, fetchImages } = useImageCache(type);

	const { filteredImages, filteredGroupedImages, availableAuthors, availableYears, getRandomImages } = useImageFilters(
		groupedImages,
		allAvailableYears,
		selectedYears,
		selectedAuthors,
	);

	const targetYearsArray = computed(() => {
		if (!requestedYears) return [];
		const val = toValue(requestedYears);
		if (!val) return [];
		return Array.isArray(val) ? val : [val];
	});

	const error = computed(() => fetchYearsError.value || fetchImagesError.value);

	fetchYears();

	watchEffect(() => {
		if (yearsLoaded.value && (targetYearsArray.value.length > 0 || allAvailableYears.value.length > 0)) {
			const yearsToFetch = targetYearsArray.value.length > 0
				? targetYearsArray.value
				: allAvailableYears.value.map(item => item.year);
			fetchImages(yearsToFetch);
		}
	});

	if (enableUrlSync) {
		watch(
			[selectedAuthors, selectedYears],
			([newAuthors, newYears]) => {
				syncUrl(newAuthors, newYears);
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
