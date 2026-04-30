<script lang="ts" setup>
import type { LandingCollectionItem } from "@nuxt/content";

const _props = defineProps<{
	data: LandingCollectionItem["reasons"];
	solidBackground?: boolean;
}>();
</script>

<template>
	<UPageSection
		v-if="data"
		:class="{ 'bg-neutral-50/50 dark:bg-neutral-900/50': solidBackground }"
		:features="data.features"
		:ui="{
			features: 'sm:grid-cols-1 md:px-16',
		}"
		:title="data.title"
	/>
</template>

<style scoped>

</style>
