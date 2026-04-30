<script lang="ts" setup>
const img = useImage();
const src = "/imgs/promo/lecture.jpg";
const placeholder = img(src, {}, { preset: "thumbnailXXSm" });
</script>

<template>
	<!--  TODO: make this a carousel -->
	<div
		class="h-full w-full lg:hover:scale-105 transition-transform rounded-xl
		light:bg-linear-to-br light:from-primary-400 light:via-tertiary-500/70 light:to-secondary-500/80
		dark:bg-linear-to-br dark:from-primary-400/70 dark:via-tertiary-500/40 dark:to-secondary-500/60"
	>
		<NuxtImg
			:placeholder="placeholder"
			:src="src"
			class="h-96 lg:h-full w-full object-cover object-[75%_25%] rounded-xl p-1"
			fetch-priority="high"
			preset="thumbnailXXLg"
			width="100%"
			height="auto"
		/>
	</div>
</template>

<style scoped>

</style>
