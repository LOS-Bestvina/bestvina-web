import { LazyImageDetailModal } from "#components";

export interface ImagePayload {
	src: string;
	returnTo?: string;
	[key: string]: unknown;
}

const PATH_PREFIX = "/imgs/";

// 1. Map long keys to single characters to save space
const KeyMap: Record<string, string> = {
	src: "s",
};
// Automatically create the reverse map for decoding
const ReverseKeyMap = Object.fromEntries(Object.entries(KeyMap).map(([k, v]) => [v, k]));

// 2. Optimized Encoder
const encodePayload = (data: ImagePayload): string => {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(data)) {
		let valStr = String(value);
		// Strip prefix if it's the src
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

// 3. Optimized Decoder
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

	const modal = overlay.create(LazyImageDetailModal);

	const openImage = async (src: string, images: string[] = [src], meta: Omit<ImagePayload, "src"> = {}) => {
		// 2. Lock the state so app.vue doesn't hijack the click
		isModalOpen.value = true;
		const optionsValue = toValue(options);

		const payload: ImagePayload = { src, ...meta };
		const encodedState = encodePayload(payload);

		if (route.query.image !== encodedState) {
			await router.push({ query: { ...route.query, image: encodedState } });
		}

		await modal.open({
			initialSrc: src,
			images: images,
			loop: optionsValue.loopImages,
			onNavigate: (newSrc: string) => {
				const newPayload: ImagePayload = { ...meta, src: newSrc };
				router.replace({
					query: { ...route.query, image: encodePayload(newPayload) },
				});
			},
		});

		if (route.query.image) {
			const newQuery = { ...route.query };
			delete newQuery.image;
			await router.replace({ query: newQuery });
		}
	};

	const closeImage = () => {
		isModalOpen.value = false; // Unlock state
		modal.close();
	};

	watch(
		() => route.query.image,
		(newQueryString) => {
			if (!newQueryString) {
				closeImage();
			}
		},
	);

	const checkGlobalUrl = () => {
		const encodedState = route.query.image as string;
		if (encodedState) {
			const decoded = decodePayload(encodedState);
			if (decoded && decoded.src) {
				const { src, ...meta } = decoded;
				openImage(src, [src], meta);
			}
		}
	};

	// 3. Export the state so app.vue can read it
	return {
		openImage,
		closeImage,
		checkGlobalUrl,
		isModalOpen,
		modal,
	};
}
