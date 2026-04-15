export function useTabUrlSync(tabs: { label: string; value: string }[], defaultPath: string) {
	const route = useRoute();
	const router = useRouter();
	const currentTab = ref(tabs[0]!.value as string);

	watch(() => route.query.t, (newTab) => {
		if (newTab && tabs.some(t => t.value === newTab)) {
			currentTab.value = newTab as string;
		}
	}, { immediate: true });

	watch(currentTab, (newTab) => {
		if (newTab !== route.query.t) {
			router.push({ path: defaultPath, query: { t: newTab }, hash: route.hash });
		}
	});

	const validateInitialTab = () => {
		const validValues = [...tabs.map(t => t.value), ""];
		if (!validValues.includes(route.query.t as string)) {
			router.push({ path: defaultPath });
			currentTab.value = tabs[0]!.value as string;
		}
		else {
			currentTab.value = route.query.t as string;
		}
	};

	return { currentTab, validateInitialTab };
}
