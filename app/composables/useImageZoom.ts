import { computed, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseImageZoomOptions {
	minScale?: number;
	maxScale?: number;
	zoomStep?: number;
	resetOn?: MaybeRefOrGetter<unknown>;
}

export function useImageZoom(
	containerRef: Ref<HTMLElement | null>,
	options: UseImageZoomOptions = {},
) {
	const minScale = options.minScale ?? 1;
	const maxScale = options.maxScale ?? 4;
	const zoomStep = options.zoomStep ?? 1.5;

	const scale = ref(1);
	const translateX = ref(0);
	const translateY = ref(0);
	const isDragging = ref(false);
	const isWheelZooming = ref(false);
	let wheelTimer: ReturnType<typeof setTimeout> | null = null;

	const isZoomed = computed(() => scale.value > 1.01);

	const getBounds = (currentScale: number) => {
		if (currentScale <= 1) return { maxX: 0, maxY: 0 };
		const rect = containerRef.value?.getBoundingClientRect();
		const width = rect?.width || (typeof window !== "undefined" ? window.innerWidth : 1000);
		const height = rect?.height || (typeof window !== "undefined" ? window.innerHeight : 800);
		return {
			maxX: Math.max(0, (width * (currentScale - 1)) / 2),
			maxY: Math.max(0, (height * (currentScale - 1)) / 2),
		};
	};

	const clamp = (val: number, max: number) => Math.max(-max, Math.min(max, val));

	const clampTranslations = (x: number, y: number, currentScale: number) => {
		const { maxX, maxY } = getBounds(currentScale);
		return {
			x: clamp(x, maxX),
			y: clamp(y, maxY),
		};
	};

	const resetZoom = () => {
		scale.value = 1;
		translateX.value = 0;
		translateY.value = 0;
		isDragging.value = false;
		isWheelZooming.value = false;
		if (wheelTimer) clearTimeout(wheelTimer);
	};

	if (options.resetOn !== undefined) {
		watch(() => toValue(options.resetOn), resetZoom);
	}

	const setScaleAt = (targetScale: number, clientX?: number, clientY?: number) => {
		const clampedScale = Math.max(minScale, Math.min(maxScale, targetScale));

		if (clampedScale <= 1.01) {
			resetZoom();
			return;
		}

		let targetX = translateX.value;
		let targetY = translateY.value;

		const el = containerRef.value;
		if (el && clientX !== undefined && clientY !== undefined) {
			const rect = el.getBoundingClientRect();
			const focalX = clientX - (rect.left + rect.width / 2);
			const focalY = clientY - (rect.top + rect.height / 2);
			const ratio = clampedScale / scale.value;
			targetX = focalX - (focalX - targetX) * ratio;
			targetY = focalY - (focalY - targetY) * ratio;
		}

		const clamped = clampTranslations(targetX, targetY, clampedScale);
		translateX.value = clamped.x;
		translateY.value = clamped.y;
		scale.value = clampedScale;
	};

	const zoomIn = () => setScaleAt(scale.value * zoomStep);
	const zoomOut = () => setScaleAt(scale.value / zoomStep);
	const toggleZoom = (clientX?: number, clientY?: number) => {
		if (isZoomed.value) resetZoom();
		else setScaleAt(2.5, clientX, clientY);
	};

	let dragStartX = 0;
	let dragStartY = 0;
	let initialTranslateX = 0;
	let initialTranslateY = 0;

	const startDrag = (clientX: number, clientY: number) => {
		isDragging.value = true;
		dragStartX = clientX;
		dragStartY = clientY;
		initialTranslateX = translateX.value;
		initialTranslateY = translateY.value;
	};

	const moveDrag = (clientX: number, clientY: number) => {
		const clamped = clampTranslations(
			initialTranslateX + (clientX - dragStartX),
			initialTranslateY + (clientY - dragStartY),
			scale.value,
		);
		translateX.value = clamped.x;
		translateY.value = clamped.y;
	};

	const endDrag = () => {
		isDragging.value = false;
	};

	const isInteractiveTarget = (e: Event) => Boolean((e.target as HTMLElement)?.closest?.("button, a"));

	const onWheel = (e: WheelEvent) => {
		if (isInteractiveTarget(e)) return;
		e.preventDefault();

		isWheelZooming.value = true;
		if (wheelTimer) clearTimeout(wheelTimer);
		wheelTimer = setTimeout(() => {
			isWheelZooming.value = false;
		}, 100);

		const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
		const factor = e.ctrlKey ? Math.exp(-delta * 0.02) : Math.exp(-delta * 0.003);
		setScaleAt(scale.value * factor, e.clientX, e.clientY);
	};

	const onPointerMove = (e: PointerEvent) => {
		if (!isDragging.value || e.pointerType === "touch") return;
		moveDrag(e.clientX, e.clientY);
	};

	const onPointerUp = (e: PointerEvent) => {
		if (e.pointerType === "touch") return;
		endDrag();
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("pointercancel", onPointerUp);
	};

	const onPointerDown = (e: PointerEvent) => {
		if (e.button !== 0 || !isZoomed.value || e.pointerType === "touch" || isInteractiveTarget(e)) return;
		e.preventDefault();
		startDrag(e.clientX, e.clientY);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerUp);
	};

	let initialPinchDistance = 0;
	let initialPinchScale = 1;
	let lastPinchCenter = { x: 0, y: 0 };
	let lastTouchTapTime = 0;

	const getTouchMetrics = (t1: Touch, t2: Touch) => ({
		distance: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
		center: { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 },
	});

	const onTouchStart = (e: TouchEvent) => {
		if (isInteractiveTarget(e)) return;

		if (e.touches.length === 2) {
			e.preventDefault();
			isDragging.value = true;
			const { distance, center } = getTouchMetrics(e.touches[0]!, e.touches[1]!);
			initialPinchDistance = distance;
			initialPinchScale = scale.value;
			lastPinchCenter = center;
			initialTranslateX = translateX.value;
			initialTranslateY = translateY.value;
			return;
		}

		if (e.touches.length === 1) {
			const touch = e.touches[0]!;
			const now = Date.now();
			if (now - lastTouchTapTime < 300) {
				e.preventDefault();
				toggleZoom(touch.clientX, touch.clientY);
				lastTouchTapTime = 0;
				return;
			}
			lastTouchTapTime = now;

			if (isZoomed.value) {
				e.preventDefault();
				startDrag(touch.clientX, touch.clientY);
			}
		}
	};

	const onTouchMove = (e: TouchEvent) => {
		if (e.touches.length === 2 && initialPinchDistance > 0) {
			e.preventDefault();
			const { distance, center } = getTouchMetrics(e.touches[0]!, e.touches[1]!);
			const ratio = distance / initialPinchDistance;
			const targetScale = Math.max(minScale * 0.8, Math.min(maxScale * 1.5, initialPinchScale * ratio));
			const clamped = clampTranslations(
				initialTranslateX + (center.x - lastPinchCenter.x),
				initialTranslateY + (center.y - lastPinchCenter.y),
				targetScale,
			);
			scale.value = targetScale;
			translateX.value = clamped.x;
			translateY.value = clamped.y;
			return;
		}

		if (e.touches.length === 1 && isZoomed.value && isDragging.value) {
			e.preventDefault();
			moveDrag(e.touches[0]!.clientX, e.touches[0]!.clientY);
		}
	};

	const onTouchEnd = (e: TouchEvent) => {
		if (e.touches.length < 2 && initialPinchDistance > 0) {
			initialPinchDistance = 0;
			if (scale.value < 1.05) resetZoom();
			else setScaleAt(Math.min(maxScale, scale.value));
		}
		if (e.touches.length === 0) {
			endDrag();
		}
	};

	const onDblClick = (e: MouseEvent) => {
		if (isInteractiveTarget(e)) return;
		e.preventDefault();
		toggleZoom(e.clientX, e.clientY);
	};

	onUnmounted(() => {
		if (wheelTimer) clearTimeout(wheelTimer);
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("pointercancel", onPointerUp);
	});

	const transformStyle = computed(() => ({
		transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`,
		transformOrigin: "center center",
		transition: isDragging.value || isWheelZooming.value ? "none" : "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
		willChange: "transform",
	}));

	const cursorStyle = computed(() => {
		if (isDragging.value) return "cursor-grabbing";
		if (isZoomed.value) return "cursor-grab";
		return "";
	});

	return {
		scale,
		translateX,
		translateY,
		isZoomed,
		isDragging,
		zoomIn,
		zoomOut,
		resetZoom,
		toggleZoom,
		transformStyle,
		cursorStyle,
		onWheel,
		onPointerDown,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
		onDblClick,
	};
}
