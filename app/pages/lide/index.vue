<script lang="ts" setup>
import { PEOPLE_PAGES } from "#shared/constants";
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
	layout: "page",
});

const { getPageData } = usePeopleData();

/**
 * TABS INITIALIZATION
 * */
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

const { currentTab, validateInitialTab } = useTabUrlSync(tabs as { label: string; value: string }[], "/lide");

if (import.meta.client) {
	validateInitialTab();
}

/**
 * INITIAL ROOT PAGE FETCH (without the tab contents)
 * */
const rootPageId = PEOPLE_PAGES.ACTIVE;
const { data: rootPage } = await getPageData(rootPageId);

if (!rootPage.value) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}

const pageId = computed(() => `${rootPageId}/${currentTab.value}`);

useSeoMeta({
	title: "Lidé",
	description: rootPage.value.description || "Seznam lidí, kteří se podílí na organizaci Běstviny.",
});
</script>

<template>
	<UPage>
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
			<ClientOnly>
				<UTabs
					v-model="currentTab"
					:content="false"
					:items="tabs"
					color="secondary"
					variant="pill"
					:ui="{
						list: 'w-full! lg:w-3/4! mx-auto',
					}"
				/>
				<PeopleScrollableGrid
					:key="pageId"
					:page-id="pageId"
				/>
				<template #fallback>
					<div class="w-full h-full flex flex-row justify-center items-center my-16">
						<UIcon
							class="text-muted"
							name="i-svg-spinners-blocks-shuffle-3"
							size="48"
						/>
					</div>
				</template>
			</ClientOnly>
		</UPageBody>
	</UPage>
</template>
