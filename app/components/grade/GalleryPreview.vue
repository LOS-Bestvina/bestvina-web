<script lang="ts" setup>
import { computed, watch } from "vue";

const props = defineProps<{
	year: string;
}>();

const emit = defineEmits<{
	(e: "hasContent", value: boolean): void;
}>();

// Utilities
const { openImage } = useImageDetail({ loopImages: true });
const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "placeholder" });

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

// Actions
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
				<NuxtImg
					v-slot="{ src, isLoaded, imgAttrs }"
					:custom="true"
					:placeholder="placeholder(item.path)"
					:src="item.path"
					:alt="`Náhodná fotografie z roku ${props.year}`"
					preset="card"
				>
					<div
						v-if="isLoaded"
						class="lg:p-2 cursor-pointer"
					>
						<img
							:key="item.path"
							:alt="`Náhodná fotografie z roku ${props.year}`"
							:src="src"
							class="w-full aspect-square object-cover rounded-md transition-transform md:hover:scale-110"
							loading="lazy"
							v-bind="imgAttrs"
							@click="openModal(item.path)"
						>
					</div>

					<USkeleton
						v-else
						class="w-full aspect-square rounded-md"
					/>
				</NuxtImg>
			</div>
		</UCarousel>
	</section>
</template>
