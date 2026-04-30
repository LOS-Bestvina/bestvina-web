<script lang="ts" setup>
import { PEOPLE_PAGES } from "#shared/constants";
import type { PeoplePageId } from "#shared/constants";

definePageMeta({
	layout: "page",
});

const route = useRoute();
const section = route.params.section as string;

const sectionMap: Record<string, PeoplePageId> = {
	vedeni: PEOPLE_PAGES.LEADERSHIP,
	externi: PEOPLE_PAGES.EXTERNAL,
	byvali: PEOPLE_PAGES.FORMER,
};

const pageId = sectionMap[section];

if (!pageId) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}

const { getPageData } = usePeopleData();

/**
 * INITIAL ROOT PAGE FETCH (without the tab contents)
 * */
const { data: page } = await getPageData(pageId);

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}
</script>

<template>
	<UPage>
		<UPageHeader
			:description="page?.headerText"
			:title="page?.header"
		/>
		<UPageBody class="mt-0">
			<UAlert
				class="mb-8"
				color="warning"
				icon="i-lucide-construction"
				title="Tato stránka je teprve rozpracovaná. Seznam lidí není zdaleka kompletní (zj. v biologické sekci). Mnoho popisků je převzato ze starého webu a nemusí být aktuální."
				variant="subtle"
			/>
			<PeopleScrollableGrid
				:key="pageId"
				:page-id="pageId"
			/>
		</UPageBody>
	</UPage>
</template>
