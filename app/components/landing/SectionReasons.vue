<script lang="ts" setup>
const { data: page } = await useAsyncData("landing-reasons", () => {
	return queryCollection("landing").first();
});
</script>

<template>
	<UPageSection
		v-if="page"
		:features="page.reasons.features"
		:ui="{
			features: 'sm:grid-cols-1 md:px-16',
		}"
		:title="page.reasons.title"
	/>
</template>

<style scoped>

</style>
