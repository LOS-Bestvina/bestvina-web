<script lang="ts" setup>
const { data: page } = await useAsyncData("landing-people", () => {
	return queryCollection("landing").first();
});

const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });
</script>

<template>
	<UPageSection
		v-if="page"
		:description="page.people.description"
		icon="i-carbon-friendship"
		orientation="horizontal"
		reverse
		:title="page.people.title"
	>
		<template #default>
			<NuxtImg
				:placeholder="placeholder(page.people.image!)"
				:src="page.people.image"
				class="h-full object-cover object-[75%_25%] lg:w-full lg:hover:scale-105 transition-transform rounded-xl"
				loading="lazy"
				preset="thumbnailXXLg"
			/>
		</template>

		<template #links>
			<UButton
				v-for="(link, index) in page.people.links"
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
