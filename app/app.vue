<script lang="ts" setup>
import { cs } from "@nuxt/ui/locale";

const nuxtApp = useNuxtApp();

onMounted(() => {
	const appContainer = shallowRef(document.getElementById("app") ?? undefined);
	nuxtApp.provide("appContainer", readonly(appContainer));
});

useHead({
	titleTemplate: (titleChunk) => {
		return titleChunk?.trim().length === 0 ? "LOS Běstvina" : `${titleChunk} | LOS Běstvina`;
	},
	title: "LOS Běstvina",
	meta: [
		{ name: "viewport", content: "width=device-width, initial-scale=1" },
	],
	link: [
		{ rel: "icon", href: "/favicon.ico" },
	],
	htmlAttrs: {
		lang: "cs",
	},
});

useSeoMeta({
	description: "Letní odborné soustředění pro mladé chemiky a biology Běstvina.",
	ogTitle: "Běstvina",
	ogDescription: "Letní odborné soustředění pro mladé chemiky a biology Běstvina.",
	ogImage: "/imgs/promo/lecture.jpg",
	twitterCard: "summary_large_image",
});

const route = useRoute();
const { checkGlobalUrl, isModalOpen } = useImageDetail();

onMounted(() => {
	if (!isModalOpen.value) {
		checkGlobalUrl();
	}
});

watch(
	() => route.query.image,
	(newVal, oldVal) => {
		if (newVal && newVal !== oldVal && !isModalOpen.value) {
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
		<div
			class="fixed inset-0 z-[-999] pointer-events-none w-full h-full blur-[100px] opacity-70"
			style="background: radial-gradient(at 0% 0%, var(--mesh-color-1) 0, transparent 80%), radial-gradient(at 100% 0%, var(--mesh-color-2) 0, transparent 80%), radial-gradient(at 50% 100%, var(--mesh-color-3) 0, transparent 80%);"
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
			title="Webová stránka je stále ve vývoji. Některé části zatím nejsou kompletní a nemusí fungovat podle představ. Díky za trpělivost!"
		/>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
