<script lang="ts" setup>
const img = useImage();
const src = "/imgs/promo/fireball.jpg";
const placeholder = img(src, {}, { preset: "thumbnailXXSm" });

const description = ref(
	"Běstvina není jako škola – nebudeš sedět v lavici a biflovat se zbytečnosti. "
	+ "Tady získáš znalosti, se kterými ohromíš rodiče, spolužáky, ale i sám sebe. "
	+ "Mimo to si vyzkoušíš práci v laboratořích se špičkovým vybavením a naučíš se poznávat přírodu kolem sebe. "
	+ "Těš se také na táboráky, sportovní vyžití a další neodborný program.");
</script>

<template>
	<UPageSection
		:description="description"
		icon="i-lucide-cat"
		orientation="horizontal"
		title="Nudit se rozhodně nebudeš!"
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
				label="Prohlédni si, co tě čeká"
				to="/informace"
				trailing-icon="i-lucide-arrow-right"
				variant="outline"
			/>
		</template>
	</UPageSection>
</template>

<style scoped>

</style>
