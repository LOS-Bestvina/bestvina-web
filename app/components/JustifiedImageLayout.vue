<script lang="ts" setup>
import { useElementSize, useWindowScroll, useWindowSize } from "@vueuse/core";
import type { BestvinaImage } from "#shared/utils/imageMapper";
import type { MaybeRef } from "vue";

export interface Props {
	groupedImages: Record<string, BestvinaImage[]>;
	gap?: number;
	targetHeight?: number;
	headerHeight?: number;
	targetHeightSmall?: number;
	imageOverlayText?: string;
	hideHeaders?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	gap: 8,
	targetHeight: 220,
	targetHeightSmall: 140,
	headerHeight: 80,
	hideHeaders: false,
});

defineSlots<{
	header(props: { year: string; item: LayoutItem }): unknown;
	image(props: { image: BestvinaImage; width: number; item: LayoutImage }): unknown;
}>();

const emit = defineEmits<{ imageClick: [src: string, allImages: string[]] }>();

const justifiedContainerRef = useTemplateRef("justifiedContainerRef");
const { width: containerWidth } = useElementSize(justifiedContainerRef,
	{ width: 0, height: 0 },
	{ box: "border-box" },
);

// Convert groupedImages object to a ref for the composable
const groupedImagesRef = computed(() => props.groupedImages);

// Compute responsive target height based on container width
const responsiveTargetHeight = computed(() => {
	return containerWidth.value < 960 ? props.targetHeightSmall : props.targetHeight;
});

// Build layout options from props
const layoutOptions = computed((): JustifiedLayoutOptions => ({
	targetHeight: responsiveTargetHeight.value,
	gap: props.gap,
	headerHeight: props.headerHeight,
	hideHeaders: props.hideHeaders,
}));

const layoutData = useJustifiedLayout(
	groupedImagesRef as MaybeRef,
	containerWidth,
	layoutOptions,
);

// --- WINDOW SCROLLING & THROTTLING ---
const { y: windowY } = useWindowScroll();
const { height: windowHeight } = useWindowSize();

const lastRenderedY = ref(0);
let renderFrame: number;

watch(windowY, (newY) => {
	if (Math.abs(newY - lastRenderedY.value) > 400) {
		cancelAnimationFrame(renderFrame);
		renderFrame = requestAnimationFrame(() => {
			lastRenderedY.value = newY;
		});
	}
}, { immediate: true });

// --- GPU WINDOW VIRTUALIZER ---
const visibleItems = computed(() => {
	const overscan = 600;
	const viewTop = lastRenderedY.value - overscan;
	const viewBottom = lastRenderedY.value + windowHeight.value + overscan;

	return layoutData.value.layoutItems.filter((item) => {
		const itemBottom = item.top + item.height;
		return itemBottom > viewTop && item.top < viewBottom;
	});
});
const isEmpty = computed(() => {
	return layoutData.value.layoutItems.length === 0 || false;
});

const openImageDetail = (src: string) => {
	const images = Object.entries(props.groupedImages)
	// sort by year in descending order
		.sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
	// extract images of each year
		.flatMap(([, yearArray]) => {
			return yearArray.map(img => img.path);
		});

	emit("imageClick", src, images);
};
</script>

<template>
	<div>
		<UEmpty
			v-if="isEmpty"
			description="Těmto filtrům neodpovídají žádné fotky. Zkus některé filtry odebrat!"
			icon="i-mdi-filter-variant-remove"
			title="Kde nic, tu nic..."
		/>
		<div
			ref="justifiedContainerRef"
			:style="{ height: `${layoutData.totalHeight}px` }"
			class="relative w-full"
		>
			<div
				v-for="item in visibleItems"
				:key="item.id"
				:style="{
					height: `${item.height}px`,
					transform: `translateY(${item.top}px)`,
				}"
				class="absolute left-0 w-full"
			>
				<!-- Header -->
				<div
					v-if="item.type === 'header'"
					class="flex items-end pb-4 pt-6 h-full"
				>
					<slot
						:item="item"
						:year="item.year"
						name="header"
					>
						<h2 class="text-3xl font-bold text-highlighted border-b-2 border-secondary pb-2">
							Ročník {{ item.year }}
						</h2>
					</slot>
				</div>

				<!-- Row of Images -->
				<div
					v-else-if="item.type === 'row'"
					:style="{ gap: `${gap}px` }"
					class="flex w-full h-full overflow-hidden"
				>
					<div
						v-for="imgObj in item.items"
						:key="imgObj.image.path"
						:style="{ width: `${imgObj.width}px` }"
						class="h-full shrink-0"
						@click="openImageDetail(imgObj.image.path)"
					>
						<slot
							:image="imgObj.image"
							:item="imgObj"
							:width="imgObj.width"
							name="image"
						>
							<GalleryImage
								:actual-width="imgObj.width"
								:overlay-text="imageOverlayText ? imageOverlayText : '📷 ' + imgObj.image.author?.name"
								:src="imgObj.image.path"
							/>
						</slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped />
