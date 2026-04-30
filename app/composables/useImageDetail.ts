import { LazyImageDetailModal } from "#components";

export interface ImagePayload {
	src: string;
	returnTo?: string;
	[key: string]: unknown;
}

const PATH_PREFIX = "/imgs/";

const KeyMap: Record<string, string> = {
	src: "s",
};
const ReverseKeyMap = Object.fromEntries(Object.entries(KeyMap).map(([k, v]) => [v, k]));

const encodePayload = (data: ImagePayload): string => {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(data)) {
		let valStr = String(value);
		if (key === "src" && valStr.startsWith(PATH_PREFIX)) {
			valStr = valStr.slice(PATH_PREFIX.length);
		}

		const shortKey = KeyMap[key] || key;
		params.set(shortKey, valStr);
	}

	// URLSearchParams automatically handles special/unicode characters safely.
	// We make the Base64 "URL-safe" by swapping +, /, and removing = padding.
	return btoa(params.toString())
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
};

export const decodePayload = (str: string): ImagePayload | null => {
	try {
		// Restore standard Base64 characters and padding
		let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
		while (b64.length % 4) b64 += "=";

		const params = new URLSearchParams(atob(b64));
		const payload: Record<string, unknown> = {};

		for (const [shortKey, value] of params.entries()) {
			const longKey = ReverseKeyMap[shortKey] || shortKey;

			// Re-apply prefix if it's the src
			if (longKey === "src" && !value.startsWith("http") && !value.startsWith(PATH_PREFIX)) {
				payload[longKey] = PATH_PREFIX + value;
			}
			else {
				payload[longKey] = value;
			}
		}

		return payload as ImagePayload;
	}
	catch (e) {
		console.log(e);
		return null;
	}
};

export interface ImageDetailOptions {
	loopImages?: boolean;
}

export function useImageDetail(options: MaybeRefOrGetter<ImageDetailOptions> = { }) {
	const isModalOpen = useState("imageDetailModalOpen", () => false);
	const route = useRoute();
	const router = useRouter();
	const overlay = useOverlay();

	const modal = import.meta.client ? overlay.create(LazyImageDetailModal) : { open: () => Promise.resolve(), close: () => {} };

	const openImage = async (src: string, images: string[] = [src], meta: Omit<ImagePayload, "src"> = {}) => {
		if (import.meta.server) return;

		// set state immediately to prevent other watchers from re-triggering this
		isModalOpen.value = true;

		const optionsValue = toValue(options);
		const payload: ImagePayload = { src, ...meta };
		const encodedState = encodePayload(payload);

		if (route.query.image !== encodedState) {
			await router.replace({
				query: { ...route.query, image: encodedState },
				hash: route.hash,
			});
		}

		await modal.open({
			initialSrc: src,
			images: images,
			loop: optionsValue.loopImages,
			onNavigate: (newSrc: string) => {
				const newPayload: ImagePayload = { ...meta, src: newSrc };
				router.replace({
					query: { ...route.query, image: encodePayload(newPayload) },
					hash: route.hash,
				});
			},
		});

		if (isModalOpen.value && route.query.image) {
			const newQuery = { ...route.query };
			delete newQuery.image;
			await router.replace({ query: newQuery, hash: route.hash });
		}
	};

	const closeImage = () => {
		if (import.meta.server) return;
		isModalOpen.value = false;
		modal.close();
	};

	onMounted(() => {
		watch(
			() => route.query.image,
			(newQueryString) => {
				if (!newQueryString && isModalOpen.value) {
					closeImage();
				}
			},
		);
	});

	const checkGlobalUrl = () => {
		if (import.meta.server) return;
		const encodedState = route.query.image as string;
		if (encodedState) {
			const decoded = decodePayload(encodedState);
			if (decoded && decoded.src) {
				const { src, ...meta } = decoded;
				openImage(src, [src], meta);
			}
		}
	};

	return {
		openImage,
		closeImage,
		checkGlobalUrl,
		isModalOpen,
		modal,
	};
}
