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
</script>

<template>
	<div v-if="landingData">
		<LandingSectionHero :data="landingData.hero" />
		<LandingSectionReasons
			:data="landingData.reasons"
			solid-background
		/>
		<LandingSectionActivities :data="landingData.activities" />
		<LandingSectionPeople
			:data="landingData.people"
			solid-background
		/>
		<LandingSectionLocation :data="landingData.location" />
		<LandingLogos class="bg-neutral-50 dark:bg-neutral-900/50" />
	</div>
</template>
