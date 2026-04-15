<script lang="ts" setup>
const { data: page } = await useAsyncData("landing-location", () => {
	return queryCollection("landing").first();
});

const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });
</script>

<template>
	<UPageSection
		v-if="page"
		:description="page.location.description"
		icon="i-lucide-map-pin"
		orientation="horizontal"
		:title="page.location.title"
	>
		<template #links>
			<UButton
				v-for="(link, index) in page.location.links"
				:key="index"
				:color="link.color as any"
				:label="link.label"
				:to="link.to"
				:trailing-icon="link.trailingIcon"
				:variant="link.variant as any"
			/>
		</template>

		<template #default>
			<NuxtImg
				:placeholder="placeholder(page.location.image!)"
				:src="page.location.image"
				class="h-full object-cover object-[75%_25%] lg:w-full lg:hover:scale-105 transition-transform rounded-xl"
				loading="lazy"
				preset="thumbnailXXLg"
			/>
		</template>
	</UPageSection>
</template>

<style scoped>

</style>
