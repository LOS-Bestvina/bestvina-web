<script lang="ts" setup>
const { data: page } = await useAsyncData("landing-hero", () => {
	return queryCollection("landing").first();
});
</script>

<template>
	<UPageHero
		v-if="page"
		:description="page.hero.description"
		:ui="{
			description: 'lg:w-3/4',
			container: 'py-16 pb-16 sm:py-8 sm:pb-16 lg:pb-0 lg:py-40',
			headline: 'w-fit',
			wrapper: 'w-fit',
			header: 'flex flex-col items-center text-center lg:text-start lg:block',
			links: 'flex flex-row flex-wrap items-center justify-center gap-4 lg:block lg:space-x-4',
		}"
		orientation="horizontal"
	>
		<template #headline>
			<!-- <LandingHeroInfoHeadline /> -->
		</template>
		<template #title>
			<span class="leading-tight flex flex-col gap-0 text-center lg:text-start">
				<span
					class="text-[clamp(1.25rem,5vw,3rem)] font-black uppercase tracking-widest mb-2 px-4 lg:px-0 lg:pe-16 whitespace-pre-wrap"
				>
					{{ page.hero.titlePrefix }}
				</span>
				<span
					class="bg-linear-to-r from-teal-500 to-teal-300 dark:from-teal-500 dark:to-teal-300 bg-clip-text text-transparent animate-gradient font-black text-[clamp(2.5rem,12vw,6rem)] py-1 pt-2"
				>
					{{ page.hero.titleMain }}
				</span>
			</span>
		</template>
		<template #links>
			<UButton
				v-for="(link, index) in page.hero.links"
				:key="index"
				:color="link.color as any"
				:label="link.label"
				:prefetch-on="'visibility'"
				:size="'xl'"
				:to="link.to"
				:trailing-icon="link.trailingIcon"
				:variant="link.variant as any"
			/>
		</template>

		<template #default>
			<LandingHeroCarousel />
		</template>
	</UPageHero>
</template>

<style scoped>
.animate-gradient {
	background-size: 300%;
	-webkit-animation: animatedgradient 8s ease-in-out infinite alternate;
	-moz-animation: animatedgradient 8s ease-in-out infinite alternate;
	animation: animatedgradient 8s ease-in-out infinite alternate;
}

@keyframes animatedgradient {
	0% {
		background-position: 0% 50%;
	}

	50% {
		background-position: 100% 50%;
	}

	100% {
		background-position: 0% 50%;
	}
}
</style>
