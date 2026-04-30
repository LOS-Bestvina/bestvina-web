<script lang="ts" setup>
import type { ButtonProps } from "#ui/components/Button.vue";

definePageMeta({
	layout: "page",
});

const _contactAction: ButtonProps = {
	label: "Napsat mail",
	icon: "i-lucide-mail-plus",
	color: "secondary",
	variant: "outline",
	to: "mailto:ferencij@vscht.cz",
};

const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });

const { data: contacts } = await useAsyncData("contacts", () => {
	return queryCollection("contacts").first();
});
</script>

<template>
	<UPage>
		<UPageHeader
			title="Kontakt"
		/>
		<UPageBody>
			<div
				class="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] justify-items-stretch gap-8 lg:gap-16"
			>
				<UCard
					v-for="(person, i) in contacts?.contacts"
					:key="i"
					class="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl"
					:ui="{
						root: 'flex flex-col h-full',
						header: 'p-0!',
						body: 'flex flex-col gap-6 p-8! grow',
						footer: 'px-8! py-6! border-t border-white/5',
					}"
				>
					<template #header>
						<div class="h-1.5 w-full bg-linear-to-r from-primary-500/30 via-primary-500/50 to-primary-500/30" />
					</template>
					<template #default>
						<div class="flex flex-col items-center text-center gap-6">
							<div class="relative">
								<NuxtImg
									v-if="person.img"
									:placeholder="placeholder(person.img)"
									:src="person.img"
									class="w-64 h-64 sm:w-64 sm:h-64 object-cover rounded-full ring-4 ring-neutral-100 dark:ring-neutral-800 transition-all duration-500 group-hover:ring-secondary-500/50 shadow-md"
									preset="thumbnailMd"
								/>
								<div
									v-else
									class="w-64 h-64 sm:w-64 sm:h-64 rounded-full bg-primary-500/5 text-primary-500 flex items-center justify-center ring-4 ring-neutral-100 dark:ring-neutral-800 transition-all duration-500 group-hover:ring-secondary-500/50 shadow-md"
								>
									<UIcon
										:name="person.icon || 'i-heroicons-user-solid'"
										class="w-16 h-16"
									/>
								</div>
							</div>
							<div>
								<p class="text-3xl font-black text-highlighted tracking-tight mb-1 group-hover:text-secondary-600 transition-colors">
									{{ person.name }}
								</p>
								<p class="text-xs font-bold text-primary-500 uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded-full inline-block">
									{{ person.role }}
								</p>
							</div>
						</div>

						<div
							v-if="person.organization || person.address"
							class="flex flex-col items-center justify-center text-center grow py-2 my-4"
						>
							<CardAddressBlock
								:name="person.organization"
								:street="person.address"
								class="whitespace-pre-wrap opacity-90"
								size="sm"
								flex-direction="col"
							/>
						</div>
					</template>

					<template #footer>
						<div class="flex flex-col gap-4 w-full">
							<div class="flex items-center gap-2 bg-zinc-400/5 p-2 rounded-lg border border-white/5">
								<UInput
									v-model="person.email"
									readonly
									class="w-full flex-1"
									variant="none"
								/>
								<CopyButton
									:value="person.email"
									size="md"
									color="neutral"
									variant="ghost"
								/>
							</div>
							<UButton
								:to="`mailto:${person.email}`"
								color="secondary"
								icon="i-heroicons-envelope-20-solid"
								label="Poslat zprávu"
								variant="soft"
								class="w-full justify-center py-2.5 font-bold hover:variant-solid transition-all"
							/>
						</div>
					</template>
				</UCard>
			</div>
		</UPageBody>
	</UPage>
</template>
