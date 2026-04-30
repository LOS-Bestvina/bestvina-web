<script lang="ts" setup>
import type { PeopleCollectionItemExtended } from "#shared/types/people";

const img = useImage();
const placeholder = (src: string) => img(src, {}, { preset: "thumbnailXXSm" });

defineProps<{
	person: PeopleCollectionItemExtended;
	pageId: string;
	showImage: boolean;
}>();
</script>

<template>
	<UCard
		v-if="person"
		class="group hover:ring-1 hover:ring-primary-500 transition-all duration-300 overflow-hidden"
		:ui="{
			root: 'flex flex-col w-full h-full',
			header: 'w-full flex flex-col items-center p-0! mx-0! overflow-hidden relative',
			body: 'p-4!',
			footer: 'flex flex-col items-center gap-4',
		}"
	>
		<template #header>
			<div
				v-if="showImage"
				class="w-full aspect-3/2 bg-zinc-100 dark:bg-zinc-800 flex justify-center items-center overflow-hidden shrink-0 relative"
			>
				<NuxtImg
					v-if="person.image"
					:placeholder="placeholder(person.image)"
					:src="person.image"
					class="w-full h-full object-cover grayscale-15 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
					preset="thumbnailLg"
				/>
				<div
					v-if="person.image"
					class="absolute inset-0 bg-linear-to-t from-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
				/>

				<UIcon
					v-else
					class="text-primary/40"
					name="i-lucide-user-round"
					size="96"
				/>
			</div>
			<div class="p-4 w-full flex flex-col justify-center overflow-hidden">
				<p
					class="text-highlighted text-xl font-extrabold tracking-tight group-hover:text-primary-500 transition-colors duration-300 truncate font-display"
				>
					{{ person.name }}
				</p>
				<p
					v-if="person.roleTitle"
					class="text-[11px] text-muted uppercase font-bold tracking-wide leading-tight line-clamp-2"
				>
					{{ person.roleTitle }}
				</p>
			</div>
		</template>

		<template #default>
			<div
				v-if="person.description"
				class="flex flex-col gap-4 whitespace-pre-wrap text-sm text-justify"
			>
				{{ person.description }}
			</div>
		</template>
	</UCard>
</template>

<style scoped>

</style>
