<script lang="ts" setup>
import { nextTick, onBeforeUpdate, onMounted, ref, watch } from "vue";
import { useSwipe } from "@vueuse/core";
import type { CopyButton } from "#components";

const props = defineProps<{
	images: string[];
	initialSrc: string;
	loop?: boolean;
	onNavigate?: (newSrc: string) => void;
}>();

const emit = defineEmits(["close"]);
const url = useRequestURL();
const img = useImage();

// Main Logic extracted to Composable
const {
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
} = useImageGallery(props.images, props.initialSrc, {
	loop: props.loop,
	onNavigate: props.onNavigate,
});

// Swipe gestures
const swipeZone = ref<HTMLElement | null>(null);
useSwipe(swipeZone, {
	onSwipeEnd(e, direction) {
		if (direction === "left") next();
		else if (direction === "right") prev();
	},
});

// Thumbnail scrolling (UI specific logic stays here)
const thumbRefs = ref<HTMLElement[]>([]);

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
		}, isInitial ? 100 : 0);
	});
};

onMounted(() => centerThumbnail(true));
watch(currentIndex, () => centerThumbnail(false), { flush: "post" });

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
									preset="thumbnailXXXLg"
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
