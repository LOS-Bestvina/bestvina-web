<script lang="ts" setup>
defineProps<{
	title: string;
	description?: string;
	icon?: string;
	iconColorClass?: string;
}>();
</script>

<template>
	<div>
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
			<slot />
		</div>
	</div>
</template>
