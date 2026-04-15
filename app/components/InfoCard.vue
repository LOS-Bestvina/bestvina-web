<script lang="ts" setup>
defineProps<{
	title: string;
	description?: string;
	icon?: string;
	iconColorClass?: string;
	to?: string;
	label?: string;
	/**
	 * Layout of the card:
	 * - 'single' → one column, one row
	 * - 'columns' → two columns side-by-side
	 * - 'rows' → two rows stacked
	 */
	layout?: "single" | "columns" | "rows";
	reversed?: boolean;
}>();

defineSlots<{
	default?: (props: Record<string, never>) => unknown;
	extra?: (props: Record<string, never>) => unknown;
	secondary?: (props: Record<string, never>) => unknown;
}>();
</script>

<template>
	<UCard
		:class="{
			'h-full': !layout || layout === 'single',
			'md:min-h-fit': layout && layout !== 'single',
		}"
		:ui="
			layout && layout !== 'single' ? {
				body: 'p-0 sm:p-0 h-full',
			} : {
				body: 'p-6 sm:p-6 flex flex-col h-full',
			}"
		class="flex flex-col overflow-hidden bg-muted"
	>
		<div
			v-if="layout === 'columns'"
			class="grid grid-cols-1 md:grid-cols-2 h-full items-stretch"
		>
			<!-- Text side -->
			<div
				:class="[reversed ? 'md:order-last' : 'md:order-first']"
				class="p-6 flex flex-col"
			>
				<div
					v-if="icon"
					class="flex items-center justify-center p-2 mb-2 bg-primary/20 w-fit aspect-square rounded-xl"
				>
					<UIcon
						:class="iconColorClass || 'text-primary'"
						:name="icon"
						class="w-10 h-10"
					/>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">
						{{ title }}
					</h3>
					<p
						v-if="description"
						class="text-muted leading-relaxed mb-4 md:mb-8"
					>
						{{ description }}
					</p>
					<!-- Extra content -->
					<slot name="extra" />
				</div>
			</div>

			<!-- Secondary column -->
			<slot
				name="secondary"
			/>
		</div>

		<div
			v-else-if="layout === 'rows'"
			class="flex flex-col h-full"
		>
			<!-- Text section -->
			<div class="p-6 flex flex-col">
				<div
					v-if="icon"
					class="flex items-center justify-center p-2 mb-2 bg-primary/20 w-fit aspect-square rounded-2xl"
				>
					<UIcon
						:class="iconColorClass || 'text-primary'"
						:name="icon"
						class="w-10 h-10 p-2 rounded-lg"
					/>
				</div>

				<div>
					<h3 class="text-xl font-bold mb-2">
						{{ title }}
					</h3>
					<p class="text-muted leading-relaxed">
						{{ description }}
					</p>
				</div>
			</div>

			<!-- Secondary row -->
			<div class="px-6 pb-6 grow">
				<slot name="secondary" />
			</div>
		</div>

		<!-- Single layout -->
		<template v-else>
			<div
				v-if="icon"
				class="flex items-center justify-center p-2 mb-2 bg-primary/20 w-fit aspect-square rounded-2xl"
			>
				<UIcon
					:class="iconColorClass || 'text-primary'"
					:name="icon"
					class="w-10 h-10 p-2 rounded-lg"
				/>
			</div>

			<div class="">
				<h3 class="text-xl text-pretty font-bold mb-2">
					{{ title }}
				</h3>
				<p class="text-muted leading-relaxed">
					{{ description }}
				</p>

				<slot />
			</div>
			<div
				v-if="to && label"
				class="mt-6 pt-2 flex items-end justify-end h-full"
			>
				<UButton
					:label="label"
					:padded="false"
					:to="to"
					class="hover:no-underline"
					color="secondary"
					trailing-icon="i-heroicons-arrow-right-20-solid"
					variant="outline"
				/>
			</div>
		</template>
	</UCard>
</template>

<style scoped>
hr {
  flex-grow: 1;
  margin-left: 0;
  border: 0;
}
</style>
