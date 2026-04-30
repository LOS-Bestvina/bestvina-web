<script lang="ts" setup>
definePageMeta({
	layout: "landing",
});

const { data: landingData } = await useAsyncData("landing-data", async () => {
	return await queryCollection("landing").first();
});

if (!landingData.value) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}

useSeoMeta({
	title: "LOS Běstvina",
	description: landingData.value.hero.description,
});
</script>

<template>
	<div v-if="landingData">
		<LandingSectionHero :data="landingData.hero" />
		<LandingSectionReasons
			v-motion-slide-visible-once-bottom
			:data="landingData.reasons"
			solid-background
		/>
		<LandingSectionActivities
			v-motion-slide-visible-once-bottom
			:data="landingData.activities"
		/>
		<LandingSectionPeople
			v-motion-slide-visible-once-bottom
			:data="landingData.people"
			solid-background
		/>
		<LandingSectionLocation
			v-motion-slide-visible-once-bottom
			:data="landingData.location"
		/>
		<LandingLogos
			v-motion-slide-visible-once-bottom
			class="bg-neutral-50 dark:bg-neutral-900/50"
		/>
	</div>
</template>
