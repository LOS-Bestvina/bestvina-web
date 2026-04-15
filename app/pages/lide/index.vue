<script lang="ts" setup>
import { PEOPLE_PAGES } from "#shared/constants";
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
	layout: "page",
});

const route = useRoute();
const router = useRouter();
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

const currentTab = ref(tabs[0]!.value as string);

// sync currentTab ref with route query
watch(() => route.query.t, (newTab) => {
	if (newTab && tabs.some(tab => tab.value === newTab)) {
		currentTab.value = newTab as string;
	}
}, { immediate: true });

// update URL when tab changes
watch(currentTab, (newTab) => {
	if (newTab !== route.query.t) {
		router.push({
			path: "/lide",
			query: { t: newTab },
		});
	}
});

const checkInitialRouteQueryParameter = () => {
	const validTabValues = [...tabs.map(value => value.value), ""];
	const selectedTabFromQuery = route.query.t as string;

	if (!validTabValues.includes(selectedTabFromQuery)) {
		// if non-existent tab requested, redirect to 'vsichni' tab
		router.push({
			path: "/lide",
		});
		currentTab.value = tabs[0]!.value as string;
	}
	else {
		currentTab.value = selectedTabFromQuery;
	}
};
// onMounted(() => {
// 	checkInitialRouteQueryParameter();
// });

if (import.meta.client) {
	checkInitialRouteQueryParameter();
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
