<script lang="ts" setup>
import { cs } from "@nuxt/ui/locale";
import type { NuxtError } from "#app";

const appContainer = useTemplateRef<HTMLElement>("app-container");
onMounted(() => {
	useNuxtApp().provide("appContainer", appContainer);
});

const props = defineProps<{
	error: NuxtError;
}>();

const errorProcessed = computed(() => {
	const status = props.error?.status || 500;
	const statusText = props.error?.statusText || "Error";
	const message = props.error?.message || "";

	let finalStatusText = statusText;
	let finalMessage = message;

	if (status === 404) {
		finalStatusText = "Nenalezeno!";
		finalMessage = "Stránka byla pravděpodobně použita k zapálení táboráku. 🔥";
	}
	else if (status === 500) {
		finalStatusText = "Interní chyba serveru. 🤷";
	}
	else if (status === 403) {
		finalStatusText = "Odepřeno!";
		finalMessage = "Tato část webu není pro tebe. 🦄";
	}

	return {
		status,
		statusText: finalStatusText,
		message: finalMessage,
	};
});
</script>

<template>
	<div
		ref="app-container"
		class="h-screen overflow-y-auto"
	>
		<UApp :locale="cs">
			<NuxtLoadingIndicator
				:height="2"
				color="var(--ui-primary)"
			/>
			<UError
				:clear="{
					icon: 'i-lucide-home',
					label: 'Domovská stránka',
					color: 'neutral',
					variant: 'solid',
					to: '/',
				}"
				:error="errorProcessed"
			/>
		</UApp>
	</div>
</template>
