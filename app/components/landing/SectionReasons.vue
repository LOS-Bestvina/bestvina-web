<script lang="ts" setup>
import type { ButtonProps } from "#ui/components/Button.vue";

const features = ref([
	{
		title: "Rozšíření obzorů",
		description:
        "Během 14 dnů načerpáš vědomosti a dovednosti, které ti škola běžně nedá. "
        + "Získáš obrovskou výhodu nejen do dalších ročníků olympiád, ale i pro budoucí studium na vysoké škole. "
        + "Naučíš se dívat na svět kolem sebe v jazyce přírodních věd.",
		icon: "i-lucide-rocket",
	},
	{
		title: "Nadšenci jako ty",
		icon: "i-lucide-hand-heart",
		description:
        "Cítíš, že tvá vášeň pro vědu ve škole naráží na nepochopení? "
        + "Na Běstvině se každé léto sejde kolem 120 studentů a studentek jako ty! "
        + "Získáš tu přátele na celý život, poznáš své budoucí spolužáky a kolegy, a třeba i najdeš někoho, "
        + "s kým jednou budeš objevovat taje biochemie hormonů...",
	},
	{
		title: "Síť kontaktů",
		description:
        "Přednášející a organizátoři tvoří rozmanitou skupinu s širokým spektrem zájmů a zaměření. "
        + "Právě z těchto setkání často vznikají pěkné spolupráce – ať už formou kvalitní studentské práce (např. SOČ), "
        + "odborné stáže, nebo budoucím zapojením do výzkumné skupiny.",
		icon: "i-carbon-network-4",
	},
]);

const links = ref<ButtonProps[]>([
	{
		color: "secondary",
		label: "Chci vědět víc",
		to: "/informace",
		trailingIcon: "i-lucide-arrow-right",
		variant: "outline",
	},
]);
</script>

<template>
	<UPageSection
		:features="features"
		:links="links"
		:ui="{
			features: 'sm:grid-cols-1 md:px-16',
		}"
		title="Tři důvody proč jet na Běstvinu..."
	/>
</template>

<style scoped>

</style>
