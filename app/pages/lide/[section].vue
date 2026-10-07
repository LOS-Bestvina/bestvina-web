<script lang="ts" setup>
import type { PeoplePageId } from "#shared/types/people";

definePageMeta({
	layout: "page",
});

const route = useRoute();
const section = route.params.section as string;

const ALLOWED_SECTIONS: readonly PeoplePageId[] = ["vedeni", "externi", "byvali"];

if (!ALLOWED_SECTIONS.includes(section as PeoplePageId)) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}

const pageId = section as PeoplePageId;

const { getPageData } = usePeopleData();

/**
 * INITIAL ROOT PAGE FETCH (without the tab contents)
 * */
const { data: page } = await getPageData(pageId);

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}

useSeoMeta({
	title: `Lidé - ${page.value.header}`,
	description: page.value.headerText || "Seznam lidí, kteří se podílí na organizaci Běstviny.",
});
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
