import { IMAGE_AUTHORS } from "#shared/utils/photographers";
import type { Photographer } from "#shared/types/photographer";

/**
 * Returns a sorted list of image authors.
 */
export default defineEventHandler((): Photographer[] => {
	return [...IMAGE_AUTHORS].sort((a, b) => a.name.localeCompare(b.name));
});
