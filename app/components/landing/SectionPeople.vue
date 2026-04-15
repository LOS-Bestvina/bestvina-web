<script lang="ts" setup>
const img = useImage();
const src = "/imgs/promo/people.jpg";
const placeholder = img(src, {}, { preset: "thumbnailXXSm" });

const description = ref(
	"O tvůj odborný i neodborný program na Běstvině se budou starat jak studenti vysokých škol jen o pár let starší než ty, "
	+ "tak i současní vědci a učitelé, kteří Běstvinu zažili z tvojí pozice také. "
	+ "Kromě nich se samozřejmě setkáš i s významnými osobnostmi, které každý rok Běstvinu navštěvují.",
);
</script>

<template>
	<UPageSection
		:description="description"
		icon="i-carbon-friendship"
		orientation="horizontal"
		reverse
		title="Lidé, se kterými si budeš rozumět!"
	>
		<template #default>
			<NuxtImg
				:placeholder="placeholder"
				:src="src"
				class="h-full object-cover object-[75%_25%] lg:w-full lg:hover:scale-105 transition-transform rounded-xl"
				loading="lazy"
				preset="thumbnailXXLg"
			/>
		</template>

		<template #links>
			<UButton
				color="secondary"
				label="Poznej nás všechny"
				to="/lide"
				trailing-icon="i-lucide-arrow-right"
				variant="outline"
			/>
		</template>
	</UPageSection>
</template>

<style scoped>

</style>
