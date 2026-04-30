<script lang="ts" setup>
import { CURRENT_YEAR } from "#shared/constants";

definePageMeta({
	layout: "page",
});

// get all years but the current one
const { data: years } = await useAsyncData("years-list", () => {
	return queryCollection("years")
		.where("year", "<>", CURRENT_YEAR)
		.order("year", "DESC")
		.all();
});

useSeoMeta({
	title: "Kronika",
	description: "Historie a minulé ročníky Běstviny.",
});
</script>

<template>
	<UPage>
		<UPageHeader
			title="Kronika"
		/>

		<UPageBody>
			<div class="relative max-w-5xl mx-auto py-8">
				<!-- Timeline line -->
				<div class="absolute left-[24px] md:left-1/2 top-4 bottom-0 w-1 bg-zinc-200 dark:bg-zinc-800 -translate-x-1/2 rounded-full hidden sm:block" />

				<div class="flex flex-col gap-16">
					<div
						v-for="(yearObj, index) in years"
						:key="index"
						v-motion-slide-visible-once-bottom
						class="relative flex w-full"
						:class="index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'"
					>
						<div class="absolute left-[24px] md:left-1/2 w-4 h-4 rounded-full bg-secondary-500 ring-4 ring-secondary-500/20 -translate-x-1/2 top-8 z-10 shadow-lg hidden sm:block" />

						<div class="w-full sm:pl-16 md:pl-0 md:w-[45%]">
							<NuxtLink
								:to="`/rocniky/${yearObj.year}`"
								class="block group"
							>
								<UCard
									class="hover:ring-1 hover:ring-secondary-500 transition-all overflow-hidden flex flex-col"
									:ui="{
										body: 'p-0 sm:p-0 flex flex-col h-full',
									}"
									variant="soft"
								>
									<NuxtImg
										:src="`${yearObj.coverImg}`"
										loading="lazy"
										preset="thumbnailLg"
										class="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-700"
									/>
									<div class="p-6 md:p-8 flex flex-col flex-grow">
										<p class="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-secondary-500 transition-colors tracking-tight">
											Ročník {{ yearObj.year }}
										</p>
										<p class="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
											{{ yearObj.theme }}
										</p>
									</div>
								</UCard>
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</UPageBody>
	</UPage>
</template>
