<script lang="ts" setup>
definePageMeta({ layout: "page" });

const targetYears = ref<string[]>([]);
const isFilterOpen = ref(false);

const {
	filteredGroupedImages,
	pending,
	error: _error,
	selectedYears,
	selectedAuthors,
	availableAuthors,
	availableYears,
} = useBestvinaImages("gallery", targetYears, { enableUrlSync: true });

const toggleYear = (year: string) => {
	if (selectedYears.value.includes(year)) {
		selectedYears.value = selectedYears.value.filter((y: string) => y !== year);
	}
	else {
		selectedYears.value.push(year);
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toggleAuthor = (author: any) => {
	const shortcut = author.shortcut || author;
	const isSelected = selectedAuthors.value.includes(shortcut);
	if (isSelected) {
		selectedAuthors.value = selectedAuthors.value.filter((a: string) => a !== shortcut);
	}
	else {
		selectedAuthors.value.push(shortcut);
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAuthorSelected = (author: any) => {
	return selectedAuthors.value.includes(author.shortcut || author);
};
</script>

<template>
	<UPage>
		<UPageHeader title="Galerie" />
		<UPageBody>
			<div class="grid grid-cols-1 lg:grid-cols-6 relative">
				<div class="lg:hidden fixed bottom-0 right-0 z-40 w-full h-16 flex items-center justify-center">
					<UButton
						v-if="!pending"
						icon="i-heroicons-funnel-20-solid"
						color="primary"
						size="xl"
						label="Filtrovat"
						class="rounded-full shadow-4xl ring-4 ring-primary-500/20"
						@click="isFilterOpen = true"
					/>
				</div>

				<USlideover
					v-model:open="isFilterOpen"
					side="bottom"
				>
					<template #content>
						<div class="p-6 flex flex-col gap-8 h-full overflow-y-auto">
							<div class="flex justify-between items-center">
								<p class="text-2xl font-black">
									Filtrování
								</p>
								<UButton
									icon="i-heroicons-x-mark-20-solid"
									color="neutral"
									variant="ghost"
									@click="isFilterOpen = false"
								/>
							</div>

							<div class="flex flex-col gap-8">
								<div>
									<p class="font-bold text-xs mb-3 uppercase tracking-widest text-muted">
										Podle ročníku
									</p>
									<div class="flex flex-wrap gap-2">
										<UButton
											v-for="year in availableYears"
											:key="year"
											:label="year"
											:color="selectedYears.includes(year) ? 'primary' : 'neutral'"
											:variant="selectedYears.includes(year) ? 'solid' : 'soft'"
											@click="toggleYear(year)"
										/>
									</div>
								</div>

								<div>
									<p class="font-bold text-xs mb-3 uppercase tracking-widest text-muted">
										Podle autora
									</p>
									<div class="flex flex-wrap gap-2">
										<UButton
											v-for="author in availableAuthors"
											:key="author.shortcut || author"
											:label="author.name || author"
											:color="isAuthorSelected(author) ? 'secondary' : 'neutral'"
											:variant="isAuthorSelected(author) ? 'solid' : 'soft'"
											@click="toggleAuthor(author)"
										/>
									</div>
								</div>

								<UButton
									class="w-full justify-center mt-4"
									color="neutral"
									label="Zrušit filtry"
									leading-icon="i-heroicons-x-mark-20-solid"
									variant="subtle"
									size="xl"
									@click="selectedAuthors = []; selectedYears = []"
								/>
							</div>
						</div>
					</template>
				</USlideover>

				<div class="hidden lg:flex flex-col lg:sticky lg:top-(--ui-header-height) h-fit gap-8 p-4 pt-6">
					<div class="border-b border-accented pb-4">
						<p class="text-2xl font-extrabold tracking-tight">
							Filtrování
						</p>
					</div>

					<div>
						<p class="font-semibold text-sm mb-3 uppercase tracking-wider text-muted">
							Podle ročníku
						</p>
						<div class="flex flex-wrap gap-2">
							<UButton
								v-for="year in availableYears"
								:key="year"
								:label="year"
								:color="selectedYears.includes(year) ? 'primary' : 'neutral'"
								:variant="selectedYears.includes(year) ? 'solid' : 'soft'"
								size="sm"
								class="transition-all"
								@click="toggleYear(year)"
							/>
						</div>
					</div>

					<div>
						<p class="font-semibold text-sm mb-3 uppercase tracking-wider text-muted">
							Podle autora
						</p>
						<div class="flex flex-wrap gap-2">
							<UButton
								v-for="author in availableAuthors"
								:key="author.shortcut || author"
								:label="author.name || author"
								:color="isAuthorSelected(author) ? 'secondary' : 'neutral'"
								:variant="isAuthorSelected(author) ? 'solid' : 'soft'"
								size="sm"
								class="transition-all"
								@click="toggleAuthor(author)"
							/>
						</div>
					</div>

					<UButton
						class="w-fit mt-2"
						color="neutral"
						label="Zrušit filtry"
						leading-icon="i-heroicons-x-mark-20-solid"
						variant="ghost"
						@click="selectedAuthors = []; selectedYears = []"
					/>
				</div>

				<ClientOnly>
					<div
						v-if="pending"
						class="w-full h-full flex flex-row justify-center items-center my-16 lg:col-span-5"
					>
						<UIcon
							class="text-neutral"
							name="i-svg-spinners-blocks-shuffle-3"
							size="48"
						/>
					</div>

					<div
						v-else
						class="px-4 lg:col-span-5"
					>
						<JustifiedImageLayout
							:grouped-images="filteredGroupedImages"
						>
							<template #empty>
								<UEmpty
									description="Těmto filtrům neodpovídají žádné fotky. Zkus některé filtry odebrat!"
									icon="i-mdi-filter-variant-remove"
									title="Kde nic, tu nic..."
								/>
							</template>
						</JustifiedImageLayout>
					</div>
				</ClientOnly>
			</div>
		</UPageBody>
	</UPage>
</template>

<style scoped />
