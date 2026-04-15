<script lang="ts" setup>
import { onMounted } from "#imports";
import { cs } from "@nuxt/ui/locale";
import type { NuxtError } from "#app";

const appContainer = useTemplateRef<HTMLElement>("app-container");
onMounted(() => {
	useNuxtApp().provide("appContainer", appContainer);
});

const props = defineProps<{
	error: NuxtError;
}>();

const errorProcessed = ref(props.error);

switch (props.error.statusCode) {
	case 404:
		errorProcessed.value.statusMessage = "Nenalezeno!";
		errorProcessed.value.message = "Stránka byla pravděpoodobně použita k zapálení táboráku. 🔥";
		break;

	case 500:
		errorProcessed.value.statusMessage = "Interní chyba serveru. 🤷";
		break;

	case 403:
		errorProcessed.value.statusMessage = "Odepřeno!";
		errorProcessed.value.message = "Tato část webu není pro tebe. 🦄";
}
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
				:error="error"
			/>
		</UApp>
	</div>
</template>
