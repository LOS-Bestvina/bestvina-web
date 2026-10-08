<script lang="ts" setup>
import { nextTick, onBeforeUpdate, onMounted, ref, watch } from "vue";
import { useSwipe } from "@vueuse/core";
import type { CopyButton } from "#components";
import { formatFileSize, formatResolution } from "#shared/utils/formatters";
import type { BestvinaImage } from "#shared/utils/imageMapper";

const props = defineProps<{
	images: string[];
	initialSrc: string;
	loop?: boolean;
	onNavigate?: (newSrc: string) => void;
}>();

const emit = defineEmits(["close"]);
const url = useRequestURL();
const img = useImage();

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
	loadedFullResImages,
	allowedMain,
	canLoadThumbnails,
	onMainLoad,
	onPlaceholderLoad,
	onThumbLoad,
	onFullResLoad,
} = useImageGallery(props.images, props.initialSrc, {
	loop: props.loop,
	onNavigate: props.onNavigate,
});

// Zoom & Pan gestures
const swipeZone = ref<HTMLElement | null>(null);
const {
	scale,
	isZoomed,
	zoomIn,
	zoomOut,
	resetZoom,
	transformStyle,
	cursorStyle,
	onWheel,
	onPointerDown,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onDblClick,
} = useImageZoom(swipeZone, { resetOn: currentSrc });

// Full-res on-demand loading
const isMainLoaded = computed(() => loadedMainImages.has(currentSrc.value));
const isFullResLoaded = computed(() => loadedFullResImages.has(currentSrc.value));

const hasZoomed = ref(false);
watch(isZoomed, (zoomed) => {
	if (zoomed) hasZoomed.value = true;
});
watch(currentSrc, () => {
	hasZoomed.value = false;
});
const shouldLoadFullRes = computed(() => hasZoomed.value || isZoomed.value || isFullResLoaded.value);

// Swipe gestures
useSwipe(swipeZone, {
	onSwipeEnd(e, direction) {
		if (isZoomed.value) return;
		if (direction === "left") next();
		else if (direction === "right") prev();
	},
});

// Thumbnail scrolling & dragging
const scrollAreaRef = ref<{ $el?: HTMLElement } | HTMLElement | null>(null);
const {
	isDragging: isStripDragging,
	onWheel: onStripWheel,
	onPointerDown: onStripPointerDown,
	onClickCapture: onStripClickCapture,
} = useDraggableScroll(scrollAreaRef);

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

// Image Metadata
const { groupedImages: galleryImages, fetchImages: fetchGalleryImages } = useImageCache("gallery");
const { groupedImages: groupsImages, fetchImages: fetchGroupsImages } = useImageCache("groups");

const imageType = computed(() => (currentSrc.value.includes("/groups/") ? "groups" : "gallery"));
const imageYear = computed(() => currentSrc.value.match(/\/years\/(\d{4})\//)?.[1] || null);

const activeImage = computed<BestvinaImage | null>(() => {
	const year = imageYear.value;
	if (!year) return null;
	const cache = imageType.value === "groups" ? groupsImages.value : galleryImages.value;
	return cache[year]?.find(img => img.path === currentSrc.value) || null;
});

const imageAlt = computed(() => {
	if (activeImage.value?.title) {
		return activeImage.value.title;
	}
	if (imageYear.value) {
		return `Fotografie z ročníku ${imageYear.value}`;
	}
	return "Fotografie z tábora Běstvina";
});

watchEffect(() => {
	const year = imageYear.value;
	if (!year) return;
	const cache = imageType.value === "groups" ? groupsImages.value : galleryImages.value;
	if (!cache[year]) {
		if (imageType.value === "groups") {
			fetchGroupsImages([year]);
		}
		else {
			fetchGalleryImages([year]);
		}
	}
});

const metadataItems = computed(() => {
	const items = [
		{
			icon: "i-lucide-file-text",
			tooltip: "Název souboru",
			value: imageTitle.value,
			mono: true,
		},
		{
			icon: "i-lucide-camera",
			tooltip: "Autor",
			value: activeImage.value?.author?.name,
		},
		{
			icon: "i-lucide-calendar",
			tooltip: activeImage.value?.date ? "Datum pořízení" : "Ročník",
			value: activeImage.value?.date || activeImage.value?.year || imageYear.value,
		},
		{
			icon: "i-lucide-maximize-2",
			tooltip: "Rozlišení",
			value: formatResolution(activeImage.value?.width, activeImage.value?.height),
		},
		{
			icon: "i-lucide-hard-drive",
			tooltip: "Velikost souboru",
			value: formatFileSize(activeImage.value?.filesize),
		},
	];

	return items.filter((item): item is typeof item & { value: string } => Boolean(item.value));
});

const downloadLinkRef = ref<HTMLAnchorElement | null>(null);
const copyButtonRef = ref<InstanceType<typeof CopyButton> | null>(null);

const triggerDownload = () => downloadLinkRef.value?.click();
const triggerShare = () => copyButtonRef.value?.triggerCopy();

defineShortcuts({
	"arrowright": next,
	"arrowleft": prev,
	"escape": () => emit("close"),
	"d": triggerDownload,
	"s": triggerShare,
	"+": zoomIn,
	"=": zoomIn,
	"-": zoomOut,
	"0": resetZoom,
	"r": resetZoom,
});
</script>

<template>
	<UModal fullscreen>
		<template #content>
			<div class="flex flex-col h-screen bg-elevated dark:bg-default backdrop-blur-sm">
				<div class="flex justify-between items-center p-4 shrink-0 z-20 border-b border-accented">
					<div class="flex gap-1 sm:gap-2">
						<UButton
							aria-label="Přiblížit"
							color="neutral"
							icon="i-heroicons-magnifying-glass-plus"
							size="xl"
							variant="ghost"
							:disabled="scale >= 4"
							@click="zoomIn"
						/>
						<UButton
							aria-label="Oddálit"
							color="neutral"
							icon="i-heroicons-magnifying-glass-minus"
							size="xl"
							variant="ghost"
							:disabled="!isZoomed"
							@click="zoomOut"
						/>
						<UButton
							v-if="isZoomed"
							aria-label="Obnovit přiblížení"
							color="neutral"
							icon="i-heroicons-arrows-pointing-in"
							size="xl"
							variant="ghost"
							@click="resetZoom"
						/>
					</div>

					<div class="flex gap-1 sm:gap-2">
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
							toast-message="Odkaz zkopírován do schránky!"
							icon="link"
							size="xl"
							variant="ghost"
						/>

						<UPopover
							mode="hover"
							enable-touch
							:content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
						>
							<UButton
								aria-label="Informace o fotografii"
								color="neutral"
								icon="i-heroicons-information-circle"
								size="xl"
								variant="ghost"
							/>

							<template #content>
								<div class="p-3 w-64 flex flex-col gap-2 text-xs">
									<div
										v-for="item in metadataItems"
										:key="item.icon"
										class="flex items-center gap-2.5"
									>
										<UIcon
											:name="item.icon"
											class="w-4 h-4 text-muted shrink-0"
											:title="item.tooltip"
											:aria-label="item.tooltip"
										/>
										<span
											:class="item.mono ? 'font-mono font-bold select-all break-all' : 'font-medium truncate text-highlighted'"
											:title="item.value"
										>
											{{ item.value }}
										</span>
									</div>
								</div>
							</template>
						</UPopover>

						<UButton
							aria-label="Zavřít"
							color="neutral"
							icon="i-heroicons-x-mark"
							size="xl"
							variant="ghost"
							@click="emit('close')"
						/>
					</div>
				</div>

				<div
					ref="swipeZone"
					:class="cursorStyle"
					class="relative flex-1 flex items-center justify-center min-h-0 px-4 sm:px-16 touch-none overflow-hidden select-none"
					@wheel.prevent="onWheel"
					@pointerdown="onPointerDown"
					@dblclick="onDblClick"
					@touchstart="onTouchStart"
					@touchmove="onTouchMove"
					@touchend="onTouchEnd"
				>
					<UButton
						v-if="images.length > 1 && canNavigate('left')"
						class="absolute left-2 sm:left-6 z-20 hidden sm:flex"
						color="neutral"
						icon="i-heroicons-chevron-left"
						size="xl"
						variant="ghost"
						@click.stop="prev"
					/>

					<div class="relative w-full h-full flex items-center justify-center">
						<Transition :name="transitionName">
							<div
								:key="currentSrc"
								class="absolute inset-0 flex items-center justify-center z-10"
							>
								<div
									class="relative w-full h-full flex items-center justify-center pointer-events-none"
									:style="transformStyle"
								>
									<UIcon
										v-if="!loadedPlaceholders.has(currentSrc) && !loadedMainImages.has(currentSrc)"
										class="animate-spin text-white w-10 h-10 absolute z-10"
										name="i-svg-spinners-ring-resize"
										size="50"
									/>

									<img
										v-show="!isMainLoaded && !isFullResLoaded"
										:src="img(currentSrc, {}, { preset: 'placeholder' })"
										:alt="imageAlt"
										class="absolute inset-0 w-full h-full object-contain blur-md opacity-70 transition-opacity duration-300 z-0"
										@load="onPlaceholderLoad(currentSrc)"
									>

									<NuxtImg
										:class="isMainLoaded && !isFullResLoaded ? 'opacity-100' : 'opacity-0'"
										:src="currentSrc"
										:alt="imageAlt"
										class="absolute inset-0 w-full h-full object-contain drop-shadow-2xl select-none transition-opacity duration-300 ease-in-out z-10"
										decoding="async"
										draggable="false"
										fetch-priority="high"
										loading="eager"
										preset="fullscreen"
										tabindex="-1"
										@load="onMainLoad(currentSrc)"
									/>

									<img
										v-if="shouldLoadFullRes"
										:src="currentSrc"
										:alt="imageAlt"
										class="absolute inset-0 w-full h-full object-contain drop-shadow-2xl select-none transition-opacity duration-300 ease-in-out z-20"
										:class="isFullResLoaded ? 'opacity-100' : 'opacity-0'"
										decoding="async"
										draggable="false"
										tabindex="-1"
										@load="onFullResLoad(currentSrc)"
									>
								</div>
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
						@click.stop="next"
					/>
				</div>

				<div
					v-if="images.length > 1"
					class="shrink-0 z-20 w-full border-t border-accented select-none"
					@wheel="onStripWheel"
					@pointerdown="onStripPointerDown"
					@click.capture="onStripClickCapture"
				>
					<UScrollArea
						ref="scrollAreaRef"
						:class="isStripDragging ? 'cursor-grabbing' : 'cursor-grab'"
						class="w-full"
						orientation="horizontal"
					>
						<div class="flex gap-4 w-max py-4 mx-auto px-[calc(50vw-32px)] sm:px-[calc(50vw-40px)]">
							<button
								v-for="(imgSrc, i) in images"
								:key="i"
								:ref="(el) => { if (el) thumbRefs[i] = el as HTMLElement }"
								:class="[
									currentSrc === imgSrc ? 'ring-2 ring-secondary scale-105 opacity-100' : 'opacity-50 hover:opacity-100',
									isStripDragging ? 'cursor-grabbing' : 'cursor-pointer',
								]"
								:aria-label="`Zobrazit fotografii ${i + 1} z ${images.length}`"
								class="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden transition-all duration-200 select-none"
								draggable="false"
								@click="goTo(i)"
								@dragstart.prevent
							>
								<USkeleton
									v-if="!loadedThumbnails.has(imgSrc)"
									class="absolute inset-0 w-full h-full rounded-md pointer-events-none"
								/>

								<NuxtImg
									v-if="canLoadThumbnails"
									:class="loadedThumbnails.has(imgSrc) ? 'opacity-100' : 'opacity-0'"
									:src="imgSrc"
									:alt="`Náhled fotografie ${i + 1} z ${images.length}`"
									class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out pointer-events-none select-none"
									decoding="async"
									draggable="false"
									loading="lazy"
									preset="thumbnail"
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
						:alt="imageAlt"
						decoding="async"
						loading="lazy"
						preset="hero"
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
