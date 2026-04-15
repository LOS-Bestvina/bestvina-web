<script lang="ts" setup>
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
	layout: "page",
});

const img = useImage();

const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });

/**
 * TABS INITIALIZATION
 * */
const tabs: TabsItem[] = [
	{
		label: "Chemie",
		icon: "i-lucide-flask-conical",
		value: "chemie",
		slot: "chemistry",
	},
	{
		label: "Biologie",
		icon: "i-mdi-bacteria-outline",
		value: "biologie",
		slot: "biology",
	},
];

const { currentTab, validateInitialTab } = useTabUrlSync(tabs as { label: string; value: string }[], "/informace");

if (import.meta.client) {
	validateInitialTab();
}

/**
 * FETCH PAGE DATA
 * */
const { pageData } = useAboutCamp();
const { data: page } = await pageData("root");

if (!page.value) {
	throw createError({ statusCode: 404, statusMessage: "Stránka nenalezena!", fatal: true });
}
</script>

<template>
	<UPage v-if="page">
		<UPageHeader
			:description="page.description"
			:title="page.title"
		/>
		<UPageBody>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<InfoCard
					v-if="page.targetPeople"
					:description="page.targetPeople.description"
					:icon="page.targetPeople.icon"
					:title="page.targetPeople.title"
					class="md:col-span-2 order-1"
					layout="columns"
				>
					<template #secondary>
						<NuxtImg
							v-if="page.targetPeople.image"
							:placeholder="placeholder(page.targetPeople.image)"
							:src="page.targetPeople.image"
							class="w-full h-full object-cover md:object-[30%_0%] lg:object-center"
							loading="lazy"
							preset="thumbnailXLg"
						/>
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.bestvinka"
					:description="page.bestvinka.description"
					:icon="page.bestvinka.icon"
					:label="page.bestvinka.linkLabel"
					:title="page.bestvinka.title"
					:to="page.bestvinka.link"
					class="order-2 md:order-8 lg:order-2"
				/>

				<InfoCard
					v-if="page.schedule"
					:description="page.schedule.description"
					:icon="page.schedule.icon"
					:title="page.schedule.title"
					class="md:row-span-2 md:col-span-2 lg:col-span-1 order-3"
					layout="rows"
				>
					<template #secondary>
						<AboutTimelineContainer :items="page.schedule.events" />
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.location"
					id="lokace"
					:description="page.location.description"
					:icon="page.location.icon"
					:title="page.location.title"
					class="md:col-span-2 order-4"
					layout="columns"
				>
					<template #extra>
						<CardAddressBlock
							name="Táborová základna VŠCHT Praha"
							street="Běstvina 155, 538 45 Běstvina"
							flex-direction="row"
						/>
					</template>
					<template #secondary>
						<AboutMapContainer :map-url="page.location.mapUrl" />
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.camp"
					:description="page.camp.description"
					:icon="page.camp.icon"
					:reversed="true"
					:title="page.camp.title"
					class="md:col-span-2 order-5"
					layout="columns"
				>
					<template #secondary>
						<UCarousel
							v-slot="{ item }"
							:autoplay="{ delay: 4500, stopOnInteraction: false }"
							:items="page.camp.images"
							:ui="{
								viewport: 'h-full',
								container: 'h-full',
								item: 'h-full',
							}"
							class="w-full"
							loop
						>
							<NuxtImg
								:placeholder="placeholder(item)"
								:src="item"
								class="w-full h-full object-cover"
								loading="lazy"
								preset="thumbnailXLg"
							/>
						</UCarousel>
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.activities"
					:description="page.activities.description"
					:icon="page.activities.icon"
					:title="page.activities.title"
					class="md:col-span-2 order-6"
					layout="columns"
				>
					<template #secondary>
						<UCarousel
							v-slot="{ item }"
							:autoplay="{ delay: 3500, stopOnInteraction: false }"
							:items="page.activities.images"
							:ui="{
								viewport: 'h-full',
								container: 'h-full',
								item: 'h-full',
							}"
							class="w-full"
							loop
						>
							<NuxtImg
								:placeholder="placeholder(item)"
								:src="item"
								class="w-full h-full object-cover"
								loading="lazy"
								preset="thumbnailXLg"
							/>
						</UCarousel>
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.stuff"
					:description="page.stuff.description"
					:icon="page.stuff.icon"
					:title="page.stuff.title"
					class="order-7"
				/>
			</div>
			<section>
				<div class="flex justify-center">
					<UTabs
						v-model="currentTab"
						:content="true"
						:items="tabs"
						:ui="{
							list: 'w-full! lg:w-1/2! mx-auto rounded-full mb-8',
							root: 'w-full md:w-3/4! mx-auto',
							indicator: `rounded-full`,
						}"
						color="secondary"
						size="xl"
						variant="pill"
					>
						<template #chemistry>
							<AboutTabbedCard
								v-if="page.chemistry"
								:color="'secondary'"
								:description="page.chemistry.description"
								:image="page.chemistry.image"
								:title="page.chemistry.title"
							/>
						</template>

						<template #biology>
							<AboutTabbedCard
								v-if="page.biology"
								:color="'green'"
								:description="page.biology.description"
								:image="page.biology.image"
								:reverse="true"
								:title="page.biology.title"
							/>
						</template>
					</UTabs>
				</div>
			</section>
			<section v-if="page.accordion">
				<PageSubHeader
					:title="page.accordion.title"
					class="text-center"
				/>
				<div class="flex justify-center pb-4">
					<UAccordion
						:items="page.accordion.items"
						:ui="{
							root: 'md:w-3/4 flex flex-col gap-4',
							item: 'border last:border border-default rounded-lg transition-transform duration-300',
							trigger: 'flex items-center rounded-lg gap-3 px-4 py-4 font-semibold text-base text-highlighted hover:bg-elevated transition-colors',
							body: 'px-4 py-2 text-sm',
						}"
					/>
				</div>
			</section>
		</UPageBody>
	</UPage>
</template>
