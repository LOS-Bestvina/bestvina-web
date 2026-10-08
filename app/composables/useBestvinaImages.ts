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

	const { data: imageYearsOverview, pending: isYearsImagesOverviewPending, error: imageYearsOverviewError, refresh: refreshImageYears } = useImageYears();
	const { groupedImages, pending, fetchImagesError, fetchImages } = useImageCache(type);

	const { filteredImages, filteredGroupedImages, availableAuthors, availableYears, getRandomImages } = useImageFilters(
		groupedImages,
		imageYearsOverview,
		selectedYears,
		selectedAuthors,
	);

	const targetYearsArray = computed(() => {
		if (!requestedYears) return [];
		const val = toValue(requestedYears);
		if (!val) return [];
		return Array.isArray(val) ? val : [val];
	});

	const error = computed(() => imageYearsOverviewError.value || fetchImagesError.value);

	refreshImageYears();

	watchEffect(() => {
		if (!isYearsImagesOverviewPending.value) {
			const yearsToFetch = targetYearsArray.value.length > 0
				? targetYearsArray.value
				: (imageYearsOverview.value?.map(item => item.year) ?? []);
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
		allAvailableYears: imageYearsOverview,
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
