<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";

interface CopyButtonProps {
	value: string;
	size?: "sm" | "md" | "lg" | "xl";
	variant?: "link" | "solid" | "outline" | "soft" | "subtle" | "ghost";
	tooltip?: string;
	icon?: "copy" | "share" | "link";
	toastMessage?: string;
}

const props = defineProps<CopyButtonProps>();

const { copy, copied } = useClipboard();

const toast = useToast();

function showToast() {
	toast.add({
		title: props.toastMessage ?? "Zkopírováno!",
		icon: "i-lucide-copy-check",
		progress: false,
		color: "success",
	});
}

function triggerCopy() {
	copy(props.value);
	showToast();
}

defineExpose({
	triggerCopy,
});

const getIcon = () => {
	switch (props.icon) {
		case "share":
			return "i-lucide-share";

		case "link":
			return "i-lucide-link";

		default:
			return copied ? "i-lucide-copy-check" : "i-lucide-copy";
	}
};
</script>

<template>
	<UTooltip
		:content="{ side: 'right' }"
		:text="tooltip ?? 'Zkopírovat do schránky'"
	>
		<UButton
			:aria-label="tooltip ?? 'Zkopírovat do schránky'"
			:color="copied ? 'success' : 'neutral'"
			:icon="getIcon()"
			:size="size ?? 'sm'"
			:variant="variant ?? 'link'"
			@click="triggerCopy"
		/>
	</UTooltip>
</template>
