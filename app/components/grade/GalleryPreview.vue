<script lang="ts" setup>
import { computed, watch } from "vue";

const props = defineProps<{
	year: string;
}>();

const emit = defineEmits<{
	(e: "hasContent", value: boolean): void;
}>();

// Data fetching
const { getRandomImages, selectedYears, pending } = useBestvinaImages("gallery", props.year);

// Explicitly sync the year prop to the composable's state
watch(
	() => props.year,
	(newYear) => {
		selectedYears.value = [newYear];
	},
	{ immediate: true },
);

const randomGalleryImages = computed(() => getRandomImages(10));
const imagesAvailable = computed(() => randomGalleryImages.value?.length > 0);

watch(pending, (isPending) => {
	if (!isPending) {
		emit("hasContent", imagesAvailable.value);
	}
});

const { openImage } = useImageDetail({ loopImages: true });
const openModal = (src: string) => {
	const images = randomGalleryImages.value.map(img => img.path);
	openImage(src, images);
};
</script>

<template>
	<section v-if="imagesAvailable">
		<PageSubHeader
			description="V karuselu se zobrazuje 10 náhodných fotografií z daného roku."
			title="Náhled galerie"
		/>

		<NuxtLink
			:to="`/galerie?y=${props.year}`"
			prefetch-on="visibility"
		>
			<UAlert
				class="hover:border-dashed hover:border transition-all"
				icon="i-lucide-gallery-thumbnails"
				title="Chceš-li zobrazit celou galerii, klikni zde!"
				variant="subtle"
			/>
		</NuxtLink>

		<UCarousel
			v-slot="{ item }"
			:autoplay="{
				delay: 5000,
				stopOnInteraction: false,
			}"
			:items="randomGalleryImages"
			:ui="{
				container: 'gap-0 p-0 ms-0',
				item: 'basis-1/2 md:basis-1/3 xl:basis-1/5 w-fit p-0 flex flex-row gap-0 justify-center',
			}"
			class="w-full mt-8 mb-16"
			dots
			loop
		>
			<div class="m-2 w-full aspect-square lg:aspect-auto">
				<div
					class="w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
					role="button"
					tabindex="0"
					:aria-label="`Zobrazit fotografii: ${item.title || 'Náhodná fotografie z roku ' + props.year}`"
					@click="openModal(item.path)"
					@keydown.enter="openModal(item.path)"
					@keydown.space.prevent="openModal(item.path)"
				>
					<GalleryImage
						:src="item.path"
						:alt="`Náhodná fotografie z roku ${props.year}`"
						preset="card"
						class="w-full h-full aspect-square"
					/>
				</div>
			</div>
		</UCarousel>
	</section>
</template>
