<script lang="ts" setup>
import { computed } from "vue";
import {
	IMAGE_PRESET_DEFINITIONS,
	type ImageFormat,
	type ImagePreset,
	type ImagePresetDefinition,
} from "#shared/constants/imagePresets";

export interface AppImageProps {
	src?: string;
	alt: string;
	preset?: ImagePreset;
	allowModal?: boolean;
	format?: ImageFormat;
	loading?: "lazy" | "eager";
	fetchpriority?: "high" | "low" | "auto";
	priority?: boolean;
	placeholder?: string | boolean;
	images?: string[];
	imgClass?: string;
}

const props = withDefaults(defineProps<AppImageProps>(), {
	allowModal: false,
	placeholder: true,
});

const resolvedFormat = computed(() => {
	if (props.format && props.format !== "auto") return props.format;
	if (!props.preset) return undefined;
	const presetDef: ImagePresetDefinition | undefined = IMAGE_PRESET_DEFINITIONS[props.preset];
	return presetDef?.modifiers.format;
});

const computedLoading = computed(() => props.loading ?? (props.priority ? "eager" : "lazy"));
const computedFetchPriority = computed(() => props.fetchpriority ?? (props.priority ? "high" : undefined));

const img = useImage();

const resolvedPlaceholder = computed(() => {
	if (props.placeholder === false) return undefined;
	if (typeof props.placeholder === "string") return props.placeholder;
	if (props.src) {
		return img(props.src, {}, { preset: "placeholder" });
	}
	return undefined;
});

const { openImage } = useImageDetail();

const handleOpenModal = () => {
	if (!props.allowModal || !props.src) return;
	openImage(props.src, props.images ?? [props.src]);
};
</script>

<template>
	<div
		v-if="src && allowModal"
		role="button"
		tabindex="0"
		class="inline-block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
		:aria-label="alt"
		@click="handleOpenModal"
		@keydown.enter.prevent="handleOpenModal"
		@keydown.space.prevent="handleOpenModal"
	>
		<NuxtImg
			:src="src"
			:alt="alt"
			:preset="preset"
			:format="resolvedFormat"
			:loading="computedLoading"
			:fetch-priority="computedFetchPriority"
			:placeholder="resolvedPlaceholder"
			:class="imgClass"
			v-bind="$attrs"
		/>
	</div>
	<NuxtImg
		v-else-if="src"
		:src="src"
		:alt="alt"
		:preset="preset"
		:format="resolvedFormat"
		:loading="computedLoading"
		:fetch-priority="computedFetchPriority"
		:placeholder="resolvedPlaceholder"
		:class="imgClass"
		v-bind="$attrs"
	/>
</template>
