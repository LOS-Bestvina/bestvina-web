<script lang="ts" setup>
import type { LandingCollectionItem } from "@nuxt/content";

const _props = defineProps<{
	data: LandingCollectionItem["activities"];
	solidBackground?: boolean;
}>();

const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });
</script>

<template>
	<UPageSection
		v-if="data"
		:class="{ 'bg-neutral-50/50 dark:bg-neutral-900/50': solidBackground }"
		:description="data.description"
		icon="i-lucide-cat"
		orientation="horizontal"
		:title="data.title"
	>
		<template #default>
			<div class="h-full w-full lg:hover:scale-105 transition-transform">
				<NuxtImg
					:placeholder="placeholder(data.image!)"
					:src="data.image"
					class="h-full object-cover object-[75%_25%] lg:w-full rounded-xl"
					loading="lazy"
					preset="thumbnailXXLg"
				/>
			</div>
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
