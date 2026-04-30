import { useThrottleFn } from "@vueuse/core";

export default function useImageGallery(images: string[], initialSrc: string, options: { loop?: boolean, onNavigate?: (src: string) => void } = {}) {
	const currentSrc = ref(initialSrc);
	const transitionName = ref("slide-left");
	const currentIndex = computed(() => images.indexOf(currentSrc.value));

	// Load state tracking
	const loadedMainImages = reactive(new Set<string>());
	const loadedPlaceholders = reactive(new Set<string>());
	const loadedThumbnails = reactive(new Set<string>());

	const onMainLoad = (src: string) => loadedMainImages.add(src);
	const onPlaceholderLoad = (src: string) => loadedPlaceholders.add(src);
	const onThumbLoad = (src: string) => loadedThumbnails.add(src);

	// Preloading logic
	const allowedMain = reactive(new Set<number>());
	const canLoadThumbnails = ref(false);

	// Thumbnail visibility control
	watch(
		loadedMainImages,
		(set) => {
			if (set.size > 0 && !canLoadThumbnails.value) canLoadThumbnails.value = true;
		},
		{ deep: true, immediate: true },
	);

	// Navigation
	const goTo = (index: number) => {
		let targetIndex = index;
		const total = images.length;

		if (options.loop) {
			if (targetIndex < 0) targetIndex = total - 1;
			if (targetIndex >= total) targetIndex = 0;
		}

		// Transition logic
		if (currentIndex.value === total - 1 && targetIndex === 0) {
			transitionName.value = "slide-left";
		}
		else if (currentIndex.value === 0 && targetIndex === total - 1) {
			transitionName.value = "slide-right";
		}
		else {
			transitionName.value = targetIndex > currentIndex.value ? "slide-left" : "slide-right";
		}

		if (images[targetIndex]) {
			currentSrc.value = images[targetIndex]!;
			if (options.onNavigate) options.onNavigate(currentSrc.value);
		}
	};

	const next = useThrottleFn(() => goTo(currentIndex.value + 1), 100);
	const prev = useThrottleFn(() => goTo(currentIndex.value - 1), 100);

	const canNavigate = (direction: "left" | "right"): boolean => {
		if (options.loop) return true;
		const shift = direction === "left" ? -1 : 1;
		const nextIndex = currentIndex.value + shift;
		return nextIndex >= 0 && nextIndex < images.length;
	};

	// Track surrounding images for preloading
	watch(
		currentIndex,
		(newIndex) => {
			const total = images.length;
			const surrounding = 1;

			for (let i = -surrounding; i <= surrounding; i++) {
				let target = newIndex + i;
				if (options.loop) {
					if (target < 0) target += total;
					if (target >= total) target -= total;
				}
				if (target >= 0 && target < total) allowedMain.add(target);
			}
		},
		{ immediate: true },
	);

	return {
		currentSrc,
		currentIndex,
		transitionName,
		goTo,
		next,
		prev,
		canNavigate,
		loadedMainImages,
		loadedPlaceholders,
		loadedThumbnails,
		allowedMain,
		canLoadThumbnails,
		onMainLoad,
		onPlaceholderLoad,
		onThumbLoad,
	};
}
