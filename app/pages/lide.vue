<script lang="ts" setup>
import { ACTIVE_ORGANIZER_ROUTES } from "#shared/constants";
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
	layout: "page",
});

const route = useRoute();

const { getPageData } = usePeopleData();
const rootPageId = "aktivni";
const { data: rootPage } = await getPageData(rootPageId);

if (!rootPage.value) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}

const tabs: TabsItem[] = [
	{
		label: "Všichni",
		icon: "i-mdi-people-group",
		value: "vsichni",
	},
	{
		label: "Chemie",
		icon: "i-lucide-flask-conical",
		value: "chemie",
	},
	{
		label: "Biologie",
		icon: "i-mdi-bacteria-outline",
		value: "biologie",
	},
	{
		label: "Ostatní",
		icon: "i-lucide-badge-question-mark",
		value: "ostatni",
	},
];

const currentTab = computed({
	get() {
		const slug = route.path.replace(/\/$/, "").split("/")[2];
		return tabs.some(tab => tab.value === slug) ? (slug as string) : "vsichni";
	},
	set(tabValue: string | number) {
		const target = tabValue === "vsichni" ? "/lide" : `/lide/${tabValue}`;
		navigateTo(target);
	},
});

const isActiveTabRoute = computed(() => {
	const normalizedPath = route.path.replace(/\/$/, "") || "/lide";
	return (ACTIVE_ORGANIZER_ROUTES as readonly string[]).includes(normalizedPath);
});

useSeoMeta({
	title: "Lidé",
	description: rootPage.value.description || "Seznam lidí, kteří se podílí na organizaci Běstviny.",
});
</script>

<template>
	<UPage v-if="isActiveTabRoute">
		<UPageHeader
			:description="rootPage?.headerText ?? ''"
			:title="rootPage?.header ?? ''"
			:ui="{
				root: 'border-0',
			}"
		/>

		<UPageBody>
			<UAlert
				class="mb-8"
				color="warning"
				icon="i-lucide-construction"
				title="Tato stránka je teprve rozpracovaná. Seznam lidí není zdaleka kompletní (zj. v biologické sekci). Mnoho popisků je převzato ze starého webu a nemusí být aktuální."
				variant="subtle"
			/>
			<UTabs
				v-model="currentTab"
				:content="false"
				:items="tabs"
				color="secondary"
				variant="pill"
				class="mb-8"
				:ui="{
					list: 'w-full! lg:w-3/4! mx-auto',
				}"
			/>
			<NuxtPage />
		</UPageBody>
	</UPage>
	<NuxtPage v-else />
</template>
