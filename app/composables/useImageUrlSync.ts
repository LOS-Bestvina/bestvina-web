export function useImageUrlSync() {
	const route = useRoute();
	const router = useRouter();

	const parseCommaQuery = (param: string | string[] | undefined | null): string[] => {
		if (!param) return [];
		const paramString = Array.isArray(param) ? param[0] : param;
		return paramString?.split(",").filter(Boolean) || [];
	};

	const initialYears = parseCommaQuery(route.query.y as string | string[] | undefined);
	const initialAuthors = parseCommaQuery(route.query.a as string | string[] | undefined);

	const syncUrl = (selectedAuthors: string[], selectedYears: string[]) => {
		router.replace({
			query: {
				...route.query,
				a: selectedAuthors.length > 0 ? selectedAuthors.join(",") : undefined,
				y: selectedYears.length > 0 ? selectedYears.join(",") : undefined,
			},
		});
	};

	return { initialYears, initialAuthors, syncUrl };
}
