import type { BestvinaImage } from "#shared/utils/imageMapper";
import type { Photographer } from "#shared/types/photographer";

export const useGalleryTopFilters = (
	availableYears: Ref<string[]>,
	availableAuthors: Ref<Photographer[]>,
	selectedYears: Ref<string[]>,
	selectedAuthors: Ref<string[]>,
	groupedImages: Ref<Record<string, BestvinaImage[]>>,
) => {
	const topYears = computed(() => {
		const sorted = [...availableYears.value].sort((a, b) => b.localeCompare(a));
		return sorted.slice(0, 10);
	});

	const olderYears = computed(() => {
		const sorted = [...availableYears.value].sort((a, b) => b.localeCompare(a));
		return sorted.slice(10);
	});

	const oldestTopYear = computed(() => {
		if (topYears.value.length === 0) return null;
		return topYears.value[topYears.value.length - 1];
	});

	const isOlderYearsSelected = computed(() => {
		return olderYears.value.length > 0 && olderYears.value.every(y => selectedYears.value.includes(y));
	});

	const toggleOlderYears = () => {
		if (isOlderYearsSelected.value) {
			selectedYears.value = selectedYears.value.filter((y: string) => !olderYears.value.includes(y));
		}
		else {
			const toAdd = olderYears.value.filter(y => !selectedYears.value.includes(y));
			selectedYears.value.push(...toAdd);
		}
	};

	const topAuthorsInfo = computed(() => {
		const authorCounts = new Map<string, number>();
		for (const year of topYears.value) {
			const images = groupedImages.value[year] || [];
			for (const img of images) {
				if (img.author) {
					const count = authorCounts.get(img.author.shortcut) || 0;
					authorCounts.set(img.author.shortcut, count + 1);
				}
			}
		}
		const sortedShortcuts = Array.from(authorCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.map(entry => entry[0]);
		const top10Shortcuts = sortedShortcuts.slice(0, 10);
		return top10Shortcuts.map(shortcut =>
			availableAuthors.value.find(a => a.shortcut === shortcut),
		).filter((a): a is NonNullable<typeof a> => Boolean(a))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const otherAuthors = computed(() => {
		const top10Shortcuts = topAuthorsInfo.value.map(a => a.shortcut);
		return availableAuthors.value.filter(a => !top10Shortcuts.includes(a.shortcut));
	});

	const isOtherAuthorsSelected = computed(() => {
		if (otherAuthors.value.length === 0) return false;
		return otherAuthors.value.every(a => selectedAuthors.value.includes(a.shortcut));
	});

	const toggleOtherAuthors = () => {
		if (isOtherAuthorsSelected.value) {
			selectedAuthors.value = selectedAuthors.value.filter((a: string) => !otherAuthors.value.some(oa => oa.shortcut === a));
		}
		else {
			const toAdd = otherAuthors.value
				.map(a => a.shortcut)
				.filter(shortcut => !selectedAuthors.value.includes(shortcut));
			selectedAuthors.value.push(...toAdd);
		}
	};

	return {
		topYears,
		olderYears,
		oldestTopYear,
		isOlderYearsSelected,
		toggleOlderYears,
		topAuthorsInfo,
		otherAuthors,
		isOtherAuthorsSelected,
		toggleOtherAuthors,
	};
};
