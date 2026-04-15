<script lang="ts" setup>
import { CURRENT_YEAR } from "#shared/constants";

const description = ref(
	"Dvoutýdenní soustředění pro nejlepší středoškolské chemiky a biology z celé České republiky podporované "
	+ "přírodovědně zaměřenými fakultami předních českých univerzit.",
);
</script>

<template>
	<UPageHero
		:description="description"
		:ui="{
			description: 'lg:max-w-[80%]',
			container: 'py-16 pb-16 sm:py-8 sm:pb-16 lg:pb-0 lg:py-40',
			headline: 'w-fit',
			wrapper: 'w-fit',
			header: 'flex flex-col items-center text-center lg:text-start lg:block',
			footer: 'flex flex-row justify-center lg:block',
		}"
		orientation="horizontal"
	>
		<template #headline>
			<!-- <LandingHeroInfoHeadline /> -->
		</template>
		<template #title>
			<span class="leading-tight flex flex-col gap-0 text-center lg:text-start">
				<span class="text-lg sm:text-2xl font-bold uppercase tracking-widest mb-2">Letní odborné soustředění</span>
				<span class="bg-linear-to-r from-teal-500 to-teal-300 dark:from-teal-500 dark:to-teal-300 bg-clip-text text-transparent animate-gradient font-black text-7xl lg:text-8xl py-1 pt-2">BĚSTVINA</span>
			</span>
		</template>
		<template #links>
			<UButton
				:to="`/rocniky/`+ CURRENT_YEAR.toString()"
				color="primary"
				label="Aktuální ročník"
				prefetch-on="visibility"
				size="xl"
				trailing-icon="i-lucide-arrow-right"
			/>
			<UButton
				color="neutral"
				label="O soustředění"
				prefetch-on="visibility"
				size="xl"
				to="/informace"
				trailing-icon="i-lucide-arrow-right"
				variant="subtle"
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
