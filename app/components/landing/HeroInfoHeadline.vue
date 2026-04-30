<script lang="ts" setup>
import { CURRENT_YEAR } from "#shared/constants";

const { isRegistrationOpen } = useRegistrationState();

const itemsToShow = computed(() => ({
	prihlasky: isRegistrationOpen.value,
	galerie: false,
}));

const allHeadlinesHidden = computed(() => {
	const values = Object.values(itemsToShow.value);
	return values.every(value => value === false);
});
</script>

<template>
	<div
		v-if="!allHeadlinesHidden"
		class="flex flex-col gap-4 w-fit"
	>
		<!-- prihlasky -->
		<NuxtLink
			v-if="itemsToShow['prihlasky']"
			:to="`/rocniky/${CURRENT_YEAR}`"
		>
			<UBadge
				color="success"
				size="lg"
				trailing-icon="i-lucide-arrow-right"
				variant="solid"
			>
				Přihlášky jsou právě otevřené!
			</UBadge>
		</NuxtLink>

		<!-- fotogalerie -->
		<NuxtLink
			v-if="itemsToShow['galerie']"
			:to="`/galerie?y=` + CURRENT_YEAR.toString()"
		>
			<UBadge
				color="secondary"
				size="lg"
				trailing-icon="i-lucide-arrow-right"
				variant="solid"
			>
				Fotogalerie byla aktualizována!
			</UBadge>
		</NuxtLink>
	</div>
</template>

<style scoped>

</style>
