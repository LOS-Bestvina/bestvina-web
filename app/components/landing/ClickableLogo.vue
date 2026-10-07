<script lang="ts" setup>
defineProps({
	src: { type: String, required: true },
	srcDark: { type: String, required: true },
	alt: { type: String, required: true },
	link: { type: String, required: true },
	extraClass: { type: String, required: false, default: "" },
});
</script>

<template>
	<NuxtLink
		:to="link"
		target="_blank"
	>
		<UColorModeImage
			:class="`w-fit h-20 lg:h-20 object-contain lg:hover:scale-105 transition-transform ${extraClass}`"
			:dark="srcDark"
			:light="src"
			:alt="alt"
			preset="card"
		/>
	</NuxtLink>
</template>

<style scoped>

</style>
