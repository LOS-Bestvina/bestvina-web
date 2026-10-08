<script lang="ts" setup>
const props = defineProps<{
	year: string;
	images: BestvinaImage[] | undefined;
}>();

const groupedImages = computed(() => {
	return {
		[props.year]: props.images ?? []
	}
})

const { openImage } = useImageDetail();
</script>

<template>
	<div>
		<PageSubHeader title="Fotografie oddílů" />

		<JustifiedImageLayout
			:grouped-images="groupedImages"
			:target-height="260"
			hide-headers
			@image-click="openImage"
		>
			<template #image="{ image, item }">
				<GalleryImage
					:actual-width="item.width"
					:overlay-text="image.title ?? ''"
					:src="image.path"
					preset="portrait"
				/>
			</template>
		</JustifiedImageLayout>
	</div>
</template>
