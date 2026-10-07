<script lang="ts" setup>
const props = defineProps<{
	mapUrl?: string;
}>();

const isLoaded = ref(false);
const isDevPreview = import.meta.dev;
const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
	if (!props.mapUrl || !mapContainer.value) return;

	const observer = new IntersectionObserver(([entry]) => {
		if (entry?.isIntersecting) {
			isLoaded.value = true;
			observer.disconnect();
		}
	}, { rootMargin: "200px" });

	observer.observe(mapContainer.value);
});
</script>

<template>
	<div
		ref="mapContainer"
		class="relative w-full md:h-full min-h-72 aspect-3/2 bg-accented/10"
	>
		<template v-if="mapUrl && !isDevPreview">
			<iframe
				v-if="isLoaded"
				:allowfullscreen="false"
				:src="mapUrl"
				class="border-0 w-full h-full animate-fade-in"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
				title="Map"
			/>

			<USkeleton
				v-else
				:ui="{ base: 'rounded-none' }"
				class="absolute inset-0 w-full h-full"
			/>
		</template>

		<div
			v-else-if="mapUrl && isDevPreview"
			class="flex items-center justify-center w-full h-full bg-primary/10"
		>
			Mapa se v dev preview nezobrazuje.
		</div>

		<div
			v-else
			class="w-full h-full bg-gray-100 dark:bg-gray-800"
		/>
	</div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
