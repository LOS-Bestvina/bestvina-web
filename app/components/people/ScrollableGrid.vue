<script lang="ts" setup>
import PersonCard from "~/components/people/PersonCard.vue";
import type { PeopleCollectionItemExtended } from "#shared/types/people";
import { PEOPLE_PAGES } from "#shared/constants";
import { formatPersonCount } from "#shared/utils/i18n";

const props = defineProps<{
	pageId: string;
}>();

const { getPopulatedPageData, getAllActivePeopleSortedForPage, getAllFormerPeopleSorted } = usePeopleData();
const pageId = toRef(props, "pageId");

const ALL_PEOPLE_PAGE_ID = `${PEOPLE_PAGES.ACTIVE}/vsichni`;

/**
 * FETCH DATA
 * */
const { data: page } = await getPopulatedPageData(pageId);

const specialPagePeople = ref<PeopleCollectionItemExtended[]>([]);

if (pageId.value === ALL_PEOPLE_PAGE_ID) {
	const { data } = await getAllActivePeopleSortedForPage(ALL_PEOPLE_PAGE_ID);
	specialPagePeople.value = data.value;
}
else if (pageId.value === PEOPLE_PAGES.FORMER) {
	const { data } = await getAllFormerPeopleSorted(PEOPLE_PAGES.FORMER);
	specialPagePeople.value = data.value;
}

/**
 * EXTRACT SECTIONS
 * */
interface Section {
	name: string;
	showImages?: boolean;
	people: PeopleCollectionItemExtended[];
}

const sections = computed<Section[]>(() => {
	if (pageId.value === ALL_PEOPLE_PAGE_ID || pageId.value === PEOPLE_PAGES.FORMER) {
		return [{
			name: "Abecední řazení",
			showImages: true,
			people: specialPagePeople.value,
		}];
	}
	return (page.value?.sections as Section[]) || [];
});

const pageStatus = computed<"success" | "error" | "empty">(() => {
	if (!page.value) return "error";

	const currentSections = sections.value;
	if (!currentSections?.length) return "empty";

	const hasPeople = currentSections.some(s => s.people?.length > 0);
	return hasPeople ? "success" : "empty";
});
</script>

<template>
	<div
		v-if="pageStatus === 'success'"
		class="w-full pb-16 flex flex-col gap-12"
	>
		<div
			v-for="(section, index) in sections"
			:key="index"
			class="flex flex-col gap-8"
		>
			<div
				v-if="section.people.length > 0"
				class="flex flex-col gap-4"
			>
				<div class="flex flex-row justify-between items-end border-b border-primary-500/10 pb-4 mt-8">
					<div class="flex items-center gap-4">
						<div
							v-if="section.name"
							class="w-2 h-8 bg-secondary-500 rounded-full"
						/>
						<p class="text-3xl font-black text-highlighted tracking-tight uppercase w-fit">
							{{ section.name }}
						</p>
					</div>
					<span class="text-muted text-sm text-center font-medium bg-zinc-400/5 px-3 py-1 rounded-full ring-1 ring-zinc-400/10 mb-1">
						{{ section.people.length }} {{ formatPersonCount(section.people.length) }}
					</span>
				</div>
				<div
					class="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] justify-items-stretch gap-8"
				>
					<PersonCard
						v-for="person in section.people"
						:key="person.id"
						:page-id="pageId"
						:person="person"
						:show-image="section.showImages ?? true"
					/>
				</div>
			</div>
		</div>
	</div>
	<InDevelopment
		v-else-if="pageStatus === 'empty'"
		:show-actions="false"
		:with-page-wrapper="false"
		class="mt-48"
		description="Tato sekce se ještě stydí ukázat se veřejnosti. 🫣"
	/>
</template>

<style scoped>

</style>
