<script lang="ts" setup>
import { useElementSize } from "@vueuse/core";

const props = defineProps<{
	src: string;
	overlayText?: string;
	alt?: string;
	preset?: string;
	actualWidth?: number;
	alt?: string;
}>();

const img = useImage();
const placeholderSrc = img(props.src, {}, { preset: "placeholder" });

const isLoaded = ref(false);

const onImageLoad = () => {
	isLoaded.value = true;
};

const el = useTemplateRef("imgContainerRef");

const isSmall = computed(() => {
	let width = props.actualWidth;
	if (!width) {
		const { width: elWidth } = useElementSize(el);
		width = elWidth.value;
	}
	return width < 240;
});
</script>

<template>
	<div
		ref="imgContainerRef"
		class="relative w-full h-full overflow-hidden rounded-md group bg-muted shrink-0"
	>
		<img
			:src="placeholderSrc"
			alt=""
			class="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-70 transition-transform duration-300 group-hover:scale-125"
		>

		<NuxtImg
			v-if="isSmall"
			:alt="alt || overlayText || 'Fotografie z galerie Běstvina'"
			:class="isLoaded ? 'opacity-100' : 'opacity-0'"
			:src="src"
			class="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
			decoding="async"
			loading="lazy"
			preset="thumbnail"
			@load="onImageLoad"
		/>
		<NuxtImg
			v-else
			:alt="alt || overlayText || 'Fotografie z galerie Běstvina'"
			:class="isLoaded ? 'opacity-100' : 'opacity-0'"
			:preset="preset ?? 'card'"
			:src="src"
			class="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
			decoding="async"
			loading="lazy"
			@load="onImageLoad"
		/>

		<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 text-white text-xs z-10 pointer-events-none">
			<p v-if="overlayText">
				{{ overlayText }}
			</p>
		</div>
	</div>
</template>
