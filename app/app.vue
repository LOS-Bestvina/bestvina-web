<script lang="ts" setup>
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
			class="fixed inset-0 z-[-999] pointer-events-none w-full h-full blur-[100px] opacity-70 transform-gpu"
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
