<script lang="ts" setup>
import { computed, watch } from "vue";

const props = defineProps<{
	year: string;
	images: BestvinaImage[] | undefined;
}>();

const randomImagesSelection = ref<BestvinaImage[]>((props.images ?? []).slice(0, 10));

function reshuffleImages(images: BestvinaImage[] | undefined = undefined) {
	if (!images || images.length === 0) {
		randomImagesSelection.value = shuffle(props.images ?? [], false).slice(0, 10);
		return;
	}
	randomImagesSelection.value = shuffle(images, false).slice(0, 10);
}

onMounted(() => {
	reshuffleImages(props.images);
});

const { openImage } = useImageDetail({ loopImages: true });

const openModal = (src: string) => {
	const images = randomImagesSelection.value.map(img => img.path);
	openImage(src, images);
};
</script>

<template>
	<div>
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
			:items="randomImagesSelection"
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
	</div>
</template>
