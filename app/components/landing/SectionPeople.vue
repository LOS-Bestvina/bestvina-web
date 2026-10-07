<script lang="ts" setup>
import type { LandingCollectionItem } from "@nuxt/content";

const _props = defineProps<{
	data: LandingCollectionItem["people"];
	solidBackground?: boolean;
}>();

const img = useImage();
const placeholder = (src?: string) => src ? img(src, {}, { preset: "placeholder" }) : undefined;
</script>

<template>
	<UPageSection
		v-if="data"
		:class="{ 'bg-neutral-50/50 dark:bg-neutral-900/50': solidBackground }"
		:description="data.description"
		icon="i-carbon-friendship"
		orientation="horizontal"
		reverse
		:title="data.title"
	>
		<template
			v-if="data.image"
			#default
		>
			<AppImage
				:placeholder="placeholder(data.image)"
				:src="data.image"
				:alt="data.title || 'Lidé na Běstvině'"
				class="h-full object-cover object-[75%_25%] lg:w-full lg:hover:scale-105 transition-transform rounded-xl"
				preset="hero"
			/>
		</template>

		<template #links>
			<UButton
				v-for="(link, index) in data.links"
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
