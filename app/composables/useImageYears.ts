/**
 * Fetches an overview of all available camp years and their image counts.
 *
 * Calls `/api/v1/images/years` and caches the result under the key `images-years-overview`.
 *
 * @returns An `AsyncData` wrapper containing an array of year summaries.
 *
 * @example
 * ```ts
 * const { data: imageYearsOverview } = await useImageYears();
 * const hasPhotos = imageYearsOverview.value.find(y => y.year === '2024')?.galleryImagesCount > 0;
 * ```
 */
export function useImageYears() {
	return useAsyncData("images-years-overview", async () => {
		const data = await $fetch("/api/v1/images/years")
		return data?.years ?? [];
	});
}
