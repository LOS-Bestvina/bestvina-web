<script lang="ts" setup>
import { computed, nextTick, onBeforeUpdate, onMounted, reactive, ref, watch } from "vue";
import { useSwipe, useThrottleFn } from "@vueuse/core";
import type { CopyButton } from "#components";

const props = defineProps<{
	images: string[];
	initialSrc: string;
	loop?: boolean;
	onNavigate?: (newSrc: string) => void;
}>();

const emit = defineEmits(["close"]);

const url = useRequestURL();

// State
const currentSrc = ref(props.initialSrc);
const transitionName = ref("slide-left");
const currentIndex = computed(() => props.images.indexOf(currentSrc.value));

// Image loading tracking
const img = useImage();
const loadedMainImages = reactive(new Set<string>());
const loadedPlaceholders = reactive(new Set<string>());
const loadedThumbnails = reactive(new Set<string>());

const onMainLoad = (src: string) => loadedMainImages.add(src);
const onPlaceholderLoad = (src: string) => loadedPlaceholders.add(src);
const onThumbLoad = (src: string) => loadedThumbnails.add(src);

// Delay thumbnail loading until at least one main image starts loading
const canLoadThumbnails = ref(false);
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

	if (props.loop) {
		if (targetIndex < 0) targetIndex = props.images.length - 1;
		if (targetIndex >= props.images.length) targetIndex = 0;
	}

	if (currentIndex.value === props.images.length - 1 && targetIndex === 0) {
		transitionName.value = "slide-left";
	}
	else if (currentIndex.value === 0 && targetIndex === props.images.length - 1) {
		transitionName.value = "slide-right";
	}
	else {
		transitionName.value = targetIndex > currentIndex.value ? "slide-left" : "slide-right";
	}

	if (props.images[targetIndex]) currentSrc.value = props.images[targetIndex]!;
	if (props.onNavigate) props.onNavigate(currentSrc.value);
};

// Throttle to prevent animation glitches when keys are held down
const next = useThrottleFn(() => goTo(currentIndex.value + 1), 100);
const prev = useThrottleFn(() => goTo(currentIndex.value - 1), 100);

const canNavigate = (direction: "left" | "right"): boolean => {
	if (props.loop) return true;
	const shift = direction === "left" ? -1 : 1;
	const nextIndex = currentIndex.value + shift;
	return nextIndex >= 0 && nextIndex < props.images.length;
};

// Swipe gestures
const swipeZone = ref<HTMLElement | null>(null);
useSwipe(swipeZone, {
	onSwipeEnd(e, direction) {
		if (direction === "left") next();
		else if (direction === "right") prev();
	},
});

// Thumbnail scrolling
const thumbRefs = ref<HTMLElement[]>([]);

// Clear refs to prevent stale DOM elements on re-renders
onBeforeUpdate(() => {
	thumbRefs.value = [];
});

const centerThumbnail = (isInitial = false) => {
	nextTick(() => {
		setTimeout(() => {
			const activeThumb = thumbRefs.value[currentIndex.value];
			if (activeThumb) {
				activeThumb.scrollIntoView({
					behavior: isInitial ? "auto" : "smooth",
					inline: "center",
					block: "nearest",
				});
			}
		}, isInitial ? 100 : 0); // Wait for initial modal animation
	});
};

onMounted(() => centerThumbnail(true));
watch(currentIndex, () => centerThumbnail(false), { flush: "post" });

// Preload queue for adjacent images
const allowedMain = reactive(new Set<number>());
watch(
	currentIndex,
	(newIndex) => {
		const totalImages = props.images.length;
		const surroundingImagesToPreload = 1;

		for (let i = -surroundingImagesToPreload; i <= surroundingImagesToPreload; i++) {
			let target = newIndex + i;
			if (props.loop) {
				if (target < 0) target += totalImages;
				if (target >= totalImages) target -= totalImages;
			}
			if (target >= 0 && target < totalImages) allowedMain.add(target);
		}
	},
	{ immediate: true },
);

// Actions & Shortcuts
const imageTitle = computed(() => currentSrc.value.split("/").pop() || "fotografie");

const downloadLinkRef = ref<HTMLAnchorElement | null>(null);
const copyButtonRef = ref<InstanceType<typeof CopyButton> | null>(null);

const triggerDownload = () => downloadLinkRef.value?.click();
const triggerShare = () => copyButtonRef.value?.triggerCopy();

defineShortcuts({
	arrowright: next,
	arrowleft: prev,
	escape: () => emit("close"),
	d: triggerDownload,
	s: triggerShare,
});
</script>

<template>
	<UModal fullscreen>
		<template #content>
			<div class="flex flex-col h-screen bg-elevated dark:bg-default backdrop-blur-sm">
				<div class="flex justify-between items-center p-4 shrink-0 z-20 border-b border-accented">
					<div class="flex gap-2">
						<a
							ref="downloadLinkRef"
							:download="imageTitle"
							:href="currentSrc"
						>
							<UButton
								aria-label="Stáhnout fotografii"
								color="neutral"
								icon="i-heroicons-arrow-down-tray"
								size="xl"
								variant="ghost"
							/>
						</a>

						<CopyButton
							ref="copyButtonRef"
							:value="url.toString()"
							icon="link"
							size="xl"
							variant="ghost"
						/>
					</div>

					<UButton
						aria-label="Zavřít"
						color="neutral"
						icon="i-heroicons-x-mark"
						size="xl"
						variant="ghost"
						@click="emit('close')"
					/>
				</div>

				<div
					ref="swipeZone"
					class="relative flex-1 flex items-center justify-center min-h-0 px-4 sm:px-16 touch-pan-y overflow-hidden"
				>
					<UButton
						v-if="images.length > 1 && canNavigate('left')"
						class="absolute left-2 sm:left-6 z-20 hidden sm:flex"
						color="neutral"
						icon="i-heroicons-chevron-left"
						size="xl"
						variant="ghost"
						@click="prev"
					/>

					<div class="relative w-full h-full flex items-center justify-center">
						<Transition :name="transitionName">
							<div
								:key="currentSrc"
								class="absolute inset-0 flex items-center justify-center z-10"
							>
								<UIcon
									v-if="!loadedPlaceholders.has(currentSrc) && !loadedMainImages.has(currentSrc)"
									class="animate-spin text-white w-10 h-10 absolute z-10"
									name="i-svg-spinners-ring-resize"
									size="50"
								/>

								<img
									v-show="!loadedMainImages.has(currentSrc)"
									:src="img(currentSrc, {}, { preset: 'thumbnailXXSm' })"
									:alt="imageTitle"
									class="absolute inset-0 w-full h-full object-contain blur-md opacity-70 transition-opacity duration-300"
									@load="onPlaceholderLoad(currentSrc)"
								>

								<NuxtImg
									:class="loadedMainImages.has(currentSrc) ? 'opacity-100' : 'opacity-0'"
									:src="currentSrc"
									:alt="imageTitle"
									class="absolute inset-0 w-full h-full object-contain drop-shadow-2xl select-none transition-opacity duration-500 ease-in-out"
									decoding="async"
									draggable="false"
									fetch-priority="high"
									loading="eager"
									preset="thumbnailXXLg"
									tabindex="-1"
									@load="onMainLoad(currentSrc)"
								/>
							</div>
						</Transition>
					</div>

					<UButton
						v-if="images.length > 1 && canNavigate('right')"
						class="absolute right-2 sm:right-6 z-20 hidden sm:flex"
						color="neutral"
						icon="i-heroicons-chevron-right"
						size="xl"
						variant="ghost"
						@click="next"
					/>
				</div>

				<div
					v-if="images.length > 1"
					class="shrink-0 z-20 w-full border-t border-accented"
				>
					<UScrollArea
						class="w-full"
						orientation="horizontal"
					>
						<div class="flex gap-4 w-max py-4 mx-auto px-[calc(50vw-32px)] sm:px-[calc(50vw-40px)]">
							<button
								v-for="(imgSrc, i) in images"
								:key="i"
								:ref="(el) => { if (el) thumbRefs[i] = el as HTMLElement }"
								:class="currentSrc === imgSrc ? 'ring-2 ring-secondary scale-105 opacity-100' : 'opacity-50 hover:opacity-100'"
								class="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden transition-all duration-200"
								@click="goTo(i)"
							>
								<USkeleton
									v-if="!loadedThumbnails.has(imgSrc)"
									class="absolute inset-0 w-full h-full rounded-md"
								/>

								<NuxtImg
									v-if="canLoadThumbnails"
									:class="loadedThumbnails.has(imgSrc) ? 'opacity-100' : 'opacity-0'"
									:src="imgSrc"
									class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
									decoding="async"
									loading="lazy"
									preset="thumbnailSm"
									@load="onThumbLoad(imgSrc)"
								/>
							</button>
						</div>
					</UScrollArea>
				</div>
			</div>

			<div class="hidden">
				<template
					v-for="(imgSrc, i) in images"
					:key="'preload-' + i"
				>
					<NuxtImg
						v-if="allowedMain.has(i) && i !== currentIndex"
						:src="imgSrc"
						decoding="async"
						loading="lazy"
						preset="thumbnailXXLg"
						@load="onMainLoad(imgSrc)"
					/>
				</template>
			</div>
		</template>
	</UModal>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from { opacity: 0; transform: translateX(50px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-50px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-50px); }
.slide-right-leave-to { opacity: 0; transform: translateX(50px); }
</style>
