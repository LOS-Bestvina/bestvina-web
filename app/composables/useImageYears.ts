interface YearsApiResponse {
	years: YearApiResponse[];
}

export interface YearApiResponse {
	year: string;
	galleryImagesCount: number;
	groupImagesCount: number;
}

export function useImageYears() {
	const allAvailableYears = ref<YearApiResponse[]>([]);
	const yearsLoaded = ref(false);
	const fetchYearsError = ref<Error | null>(null);

	const fetchYears = async () => {
		if (yearsLoaded.value)
			return;

		try {
			const data = await $fetch<YearsApiResponse>("/api/v1/images/years");
			allAvailableYears.value = data?.years || [];
		}
		catch (err) {
			console.error("Failed to fetch years:", err);
			fetchYearsError.value = err instanceof Error ? err : new Error("Failed to fetch years");
			allAvailableYears.value = [];
		}
		finally {
			yearsLoaded.value = true;
		}
	};

	return { allAvailableYears, yearsLoaded, fetchYearsError, fetchYears };
}
