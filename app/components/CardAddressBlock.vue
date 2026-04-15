<script lang="ts" setup>
const props = defineProps<{
	name?: string;
	street?: string;
	country?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	iconSize?: number;
}>();

const iconSizeValue = computed(() => props.iconSize ?? 5);
const textSizeClass = computed(() => {
	const sizes: Record<string, string> = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
		xl: "text-xl",
	};
	return sizes[props.size ?? "md"];
});
</script>

<template>
	<div class="flex items-start gap-3 pt-2">
		<UIcon
			:class="['w-'+iconSizeValue, 'h-'+iconSizeValue]"
			class="w-5 h-5 text-secondary mt-1 shrink-0"
			name="i-heroicons-map-pin-solid"
		/>

		<div
			:class="[textSizeClass]"
			class="leading-relaxed"
		>
			<p
				v-if="name"
				class="font-bold"
			>
				{{ name }}
			</p>
			<p v-if="street">
				{{ street }}
			</p>
			<p v-if="country">
				{{ country }}
			</p>
		</div>
	</div>
</template>
