export function useTabUrlSync(tabs: { label: string; value: string }[], defaultPath: string) {
	const route = useRoute();
	const router = useRouter();
	const initialTab = (route.query.t && tabs.some(t => t.value === route.query.t))
		? route.query.t as string
		: tabs[0]!.value as string;
	const currentTab = ref(initialTab);

	if (import.meta.client) {
		watch(() => route.query.t, (newTab) => {
			if (newTab && tabs.some(t => t.value === newTab)) {
				if (currentTab.value !== newTab) {
					currentTab.value = newTab as string;
				}
			}
		}, { immediate: true });

		watch(currentTab, (newTab) => {
			if (newTab !== route.query.t) {
				router.replace({
					path: defaultPath,
					query: { ...route.query, t: newTab },
					hash: route.hash,
				});
			}
		});
	}

	const validateInitialTab = () => {
		if (import.meta.server) return;
		const validValues = [...tabs.map(t => t.value), ""];
		const currentT = route.query.t as string;

		if (!validValues.includes(currentT)) {
			const defaultTab = tabs[0]!.value as string;
			router.replace({
				path: defaultPath,
				query: { ...route.query, t: defaultTab },
				hash: route.hash,
			});
			currentTab.value = defaultTab;
		}
		else if (currentT && currentTab.value !== currentT) {
			currentTab.value = currentT;
		}
	};

	return { currentTab, validateInitialTab };
}
