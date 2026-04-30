import { CURRENT_YEAR } from "#shared/constants";

export const useRegistrationState = () => {
	const { data: currentYearPage, pending, error } = useAsyncData("current-year-data", () => {
		return queryCollection("years").path(`/years/${CURRENT_YEAR}`).first();
	});

	const isRegistrationOpen = computed(() => {
		const deadline = currentYearPage.value?.registration?.deadline;
		if (!deadline) return false;

		const deadlineDate = new Date(deadline);
		deadlineDate.setHours(23, 59, 59, 999);

		return new Date() <= deadlineDate;
	});

	return {
		currentYearPage,
		isRegistrationOpen,
		pending,
		error,
	};
};
