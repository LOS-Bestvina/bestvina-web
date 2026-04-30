<script lang="ts" setup>
const props = defineProps<{
	year: string;
}>();

const emit = defineEmits<{
	(e: "hasContent", value: boolean): void;
}>();

const { filteredGroupedImages, selectedYears, pending } = useBestvinaImages("groups", props.year);

const { openImage } = useImageDetail();

watch(
	() => props.year,
	(newYear) => {
		selectedYears.value = [newYear];
	},
	{ immediate: true },
);

const imagesAvailable = computed(() => {
	return Object.values(filteredGroupedImages.value).length !== 0;
});

watch(pending, (isPending) => {
	if (!isPending) {
		emit("hasContent", imagesAvailable.value);
	}
});
</script>

<template>
	<section
		v-if="imagesAvailable"
	>
		<PageSubHeader title="Fotografie oddílů" />

		<JustifiedImageLayout
			:grouped-images="filteredGroupedImages"
			:target-height="260"
			hide-headers
			@image-click="openImage"
		>
			<template #image="{ image, item }">
				<GalleryImage
					:actual-width="item.width"
					:overlay-text="image.title ?? ''"
					:src="image.path"
					preset="thumbnailLg"
				/>
			</template>
		</JustifiedImageLayout>
	</section>
</template>
