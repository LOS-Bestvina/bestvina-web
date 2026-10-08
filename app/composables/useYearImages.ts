import type { ImageType } from "#shared/types";


/**
 * Fetches group images for a specific year.
 *
 * Convenience wrapper around {@link useYearImages} with `type: "groups"`.
 *
 * @param year - Year as a string, number, `ref`, or getter.
 * @returns An `AsyncData` wrapper resolving to `{ images: BestvinaImage[] }`.
 *
 * @example
 * ```ts
 * const { data: groupImageData } = await useYearGroupImages(2026);
 * console.log(groupImageData.value?.images);
 * ```
 */
export function useYearGroupImages(year: MaybeRefOrGetter<string | number>) {
    return useYearImages(year, "groups");
}



/**
 * Fetches general gallery photographs for a specific camp year.
 *
 * Convenience wrapper around {@link useYearImages} with `type: "gallery"`.
 *
 * @param year - Year as a string, number, `ref`, or getter.
 * @returns An `AsyncData` wrapper resolving to `{ images: BestvinaImage[] }`.
 *
 * @example
 * ```ts
 * const { data: galleryImageData } = await useYearGalleryImages(2026);
 * console.log(galleryImageData.value?.images);
 * ```
 */
export function useYearGalleryImages(year: MaybeRefOrGetter<string | number>) {
    return useYearImages(year, "gallery");
}


/**
 * Fetches images of a given type for a specific year.
 *
 * Leverages {@link useImageCache} under the hood to deduplicate network requests
 * and caches the result under the key `year-images-${type}-${year}`.
 *
 * @param year - Year as a string, number, `ref`, or getter.
 * @param type - Image category to fetch (`"groups"` or `"gallery"`).
 * @returns An `AsyncData` wrapper resolving to an object containing the `images` array.
 *
 * @example
 * ```ts
 * const { data, status, error } = await useYearImages('2026', 'gallery');
 * const images = data.value?.images ?? [];
 * ```
 */
export function useYearImages(year: MaybeRefOrGetter<string | number>, type: ImageType) {
    const yearStr = computed(() => toValue(year).toString());

    return useAsyncData(`year-images-${type}-${yearStr.value}`, async () => {

        const { getYearImages } = useImageCache(type);
        const images = await getYearImages(yearStr.value);

        return {
            images: images ?? [],
        }
    })
}