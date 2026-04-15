<script lang="ts" setup>
const { data: page } = await useAsyncData("landing-activities", () => {
	return queryCollection("landing").first();
});

const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });
</script>

<template>
	<UPageSection
		v-if="page"
		:description="page.activities.description"
		icon="i-lucide-cat"
		orientation="horizontal"
		:title="page.activities.title"
	>
		<template #default>
			<NuxtImg
				:placeholder="placeholder(page.activities.image!)"
				:src="page.activities.image"
				class="h-full object-cover object-[75%_25%] lg:w-full lg:hover:scale-105 transition-transform rounded-xl"
				loading="lazy"
				preset="thumbnailXXLg"
			/>
		</template>

		<template #links>
			<UButton
				v-for="(link, index) in page.activities.links"
				:key="index"
				:color="link.color as any"
				:label="link.label"
				:to="link.to"
				:trailing-icon="link.trailingIcon"
				:variant="link.variant as any"
			/>
		</template>
	</UPageSection>
</template>

<style scoped>

</style>
