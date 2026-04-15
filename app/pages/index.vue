<script lang="ts" setup>
definePageMeta({
	layout: "landing",
});
</script>

<template>
	<div>
		<UMain>
			<LandingSectionHero />

			<LandingSectionReasons
				v-motion-slide-visible-once-bottom
				class="bg-neutral-50 dark:bg-neutral-900"
			/>

			<LandingSectionActivities v-motion-slide-visible-once-bottom />

			<LandingSectionPeople
				v-motion-slide-visible-once-bottom
				class="bg-neutral-50 dark:bg-neutral-900"
			/>

			<LandingSectionLocation v-motion-slide-visible-once-bottom />

			<LandingLogos
				v-motion-fade-visible-once
				class="bg-neutral-50 dark:bg-neutral-900"
			/>
		</UMain>
	</div>
</template>
