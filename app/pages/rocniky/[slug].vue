<script lang="ts" setup>
import { CURRENT_YEAR } from "#shared/constants";

definePageMeta({
	layout: "page",
});

const route = useRoute();
const routePathEnglish = route.path.replace("rocniky", "years");

const { data: page } = await useAsyncData(routePathEnglish, () => {
	return queryCollection("years").path(routePathEnglish).first();
});

if (!page.value || !page.value.year) {
	throw createError({ statusCode: 404, statusMessage: "Ročník nenalezen!", fatal: true });
}

const isCurrentYear = computed(() => Number(page.value?.year) === CURRENT_YEAR);

// get surroundings for navigation
async function getSurroundings() {
	const { data: surround } = await useAsyncData(`${routePathEnglish}-surround`, () => {
		return queryCollectionItemSurroundings("years", routePathEnglish, {
			fields: ["year", "theme", "title", "description"],
		}).where("year", "<>", CURRENT_YEAR)
			.order("year", "DESC");
	});

	// replace the default title and description with year and theme, respectively
	surround?.value?.map((item) => {
		if (item) {
			item.description = `Ročník ${item.year || "´???"}`;
			item.title = item.theme as string || "";
			item.path = item.path.replace("years", "rocniky");
		}
	});
	return surround;
}
const surround = await getSurroundings();

// date formatter -> ddd dd. MM.
const formatDate = (dateString: string, prefix: string = "", thisYearEmptyValue: string = "bude upřesněno") => {
	if (!dateString)
		return isCurrentYear.value ? thisYearEmptyValue : "---";
	const date = new Date(dateString ?? "");
	if (isNaN(date.getTime()))
		return dateString ? dateString : "---";
	return prefix + date.toLocaleString("cs-CZ", {
		weekday: "short", day: "numeric", month: "numeric",
	});
};

const formatDateRange = (dateStringStart: string, dateStringEnd: string, thisYearEmptyValue: string = "bude upřesněno") => {
	if (!dateStringStart && !dateStringEnd)
		return isCurrentYear.value ? thisYearEmptyValue : "---";

	const start = formatDate(dateStringStart, "", isCurrentYear.value ? thisYearEmptyValue : "???");
	const end = formatDate(dateStringEnd, "", isCurrentYear.value ? thisYearEmptyValue : "???");

	return start + " \u2013 " + end;
};

// price formatter -> <number> Kč
const formatPrice = (price: number | undefined, thisYearEmptyValue: string = "bude upřesněno") => {
	if (!price)
		return isCurrentYear.value ? thisYearEmptyValue : "---";
	if (isNaN(price))
		return "---";
	return `${price} Kč`;
};

const hasGroupImages = ref(false);
const hasGalleryPreview = ref(false);
const checksCompleted = ref(0);
</script>

<template>
	<UPage
		v-if="page"
		id="pageId"
	>
		<UPageHeader
			:description="(!page.theme && isCurrentYear) ? 'Táborové téma se dozvíš až na začátku soustředění!' : ''"
			:headline="`Ročník ${page.year}`"
			:title="page.theme || (isCurrentYear ? 'Aktuální ročník' : '')"
		/>
		<UPageBody>
			<section
				v-show="isCurrentYear"
				class="grid grid-cols-1 md:grid-cols-3 gap-6"
			>
				<InfoCard
					v-if="page.term"
					icon="i-lucide-calendar-days"
					title="Termín konání"
				>
					<template #default>
						<div class="flex flex-col gap-2">
							<p class="text-2xl font-bold text-secondary">
								{{ formatDateRange(page.term.startDate, page.term.endDate, "bude upřesněn") }}
							</p>
							<p class="text-muted text-sm whitespace-pre-wrap">
								{{ page.term.note }}
							</p>
						</div>
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.pricing"
					icon="i-lucide-coins"
					title="Cena soustředění"
				>
					<template #default>
						<div class="flex flex-col gap-2">
							<div class="flex gap-2 items-center justify-between">
								<p class="text-2xl font-bold text-secondary">
									{{ formatPrice(page.pricing.price, "bude upřesněna") }}
								</p>
								<UPopover
									v-if="page.pricing.price && page.pricing.additionalInfo"
									mode="click"
								>
									<UButton
										color="neutral"
										label="Informace"
										leading-icon="i-lucide-info"
										variant="subtle"
									/>
									<template #content>
										<div class="p-2 max-w-72 text-sm">
											{{ page.pricing.additionalInfo }}
										</div>
									</template>
								</UPopover>
							</div>
							<p class="text-muted text-sm whitespace-pre-wrap">
								{{ page.pricing.note }}
							</p>
						</div>
					</template>
				</InfoCard>

				<InfoCard
					v-if="page.registration"
					icon="i-mdi-document-sign"
					title="Přihláška"
				>
					<template #default>
						<div class="flex flex-col gap-2">
							<div class="flex gap-2 items-center justify-between">
								<p class="text-2xl font-bold text-secondary">
									{{ formatDate(page.registration.deadline, "do ") }}
								</p>
								<UButton
									v-if="page.registration.link"
									:color="!page.registration.link ? 'neutral' : 'success'"
									:disabled="!page.registration.link"
									:to="page.registration.link"
									label="Přihláška"
									leading-icon="i-lucide-info"
									variant="subtle"
								/>
							</div>
							<p class="text-muted text-sm whitespace-pre-wrap">
								{{ page.registration.note }}
							</p>
						</div>
					</template>
				</InfoCard>

				<ContentRenderer :value="page.body" />
			</section>

			<div v-show="!isCurrentYear && (hasGroupImages || hasGalleryPreview)">
				<USeparator icon="i-mdi-history" />

				<!-- Group Photos -->
				<GradeGroupImages
					:year="page.year.toString()"
					@has-content="(val) => { hasGroupImages = val; checksCompleted++ }"
				/>

				<!-- Gallery -->
				<GradeGalleryPreview
					:year="page.year.toString()"
					@has-content="(val) => { hasGalleryPreview = val; checksCompleted++ }"
				/>
			</div>
			<div
				v-if="!isCurrentYear && checksCompleted >= 2 && !hasGroupImages && !hasGalleryPreview"
			>
				<USeparator
					class="mb-8"
					icon="i-mdi-history"
				/>
				<UEmpty
					description="Tady se časem objeví fotografie oddílů a náhled galerie..."
					icon="i-lucide-hourglass"
					title="Příliš brzy na pohled do minulosti!"
				/>
			</div>
			<div v-if="!isCurrentYear">
				<UContentSurround
					:surround="surround"
					class="mt-16"
				/>
			</div>
		</UPageBody>
	</UPage>
</template>

<style scoped>
</style>
