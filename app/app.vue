<script lang="ts" setup>
import { onMounted } from "#imports";
import { cs } from "@nuxt/ui/locale";

const nuxtApp = useNuxtApp();
const pageContainer = useTemplateRef<HTMLElement>("page");

onMounted(() => {
	const appContainer = shallowRef(document.getElementById("app"));
	nuxtApp.provide("appContainer", readonly(appContainer));
	nuxtApp.provide("pageContainer", readonly(pageContainer));
});

useHead({
	meta: [
		{ name: "viewport", content: "width=device-width, initial-scale=1" },
	],
	link: [
		{ rel: "icon", href: "/favicon.ico" },
	],
	htmlAttrs: {
		lang: "cs",
	},
	title: "Běstvina",
});

// IMAGE DETAIL GLOBAL OPENER
const { checkGlobalUrl, isModalOpen } = useImageDetail();
const route = useRoute();

onMounted(() => {
	checkGlobalUrl();
});

watch(
	() => route.query.image,
	(newVal, oldVal) => {
		// Only trigger globally if the modal isn't already handling the sequence
		if (newVal && !oldVal && !isModalOpen.value) {
			checkGlobalUrl();
		}
	},
);
</script>

<template>
	<UApp
		:locale="cs"
	>
		<NuxtLoadingIndicator
			:height="2"
			color="var(--ui-primary)"
		/>
		<UBanner
			id="in-development"
			color="secondary"
			variant="soft"
			icon="i-heroicons-beaker"
			:ui="{
				root: 'py-2 ring-1 ring-secondary-500/20 backdrop-blur-md',
				title: 'line-clamp-3 whitespace-normal font-medium',
			}"
			class="h-fit"
			close
			title="Na webu se stále usilovně pracuje. Omluv případné chyby nebo chybějící části."
		/>
		<NuxtLayout>
			<div
				ref="page"
			>
				<NuxtPage />
			</div>
		</NuxtLayout>
	</UApp>
</template>
