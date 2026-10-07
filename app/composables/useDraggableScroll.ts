import { onUnmounted, ref, type Ref } from "vue";

export function useDraggableScroll(targetRef: Ref<HTMLElement | { $el?: HTMLElement } | null>) {
	const isDragging = ref(false);
	let startX = 0;
	let startScroll = 0;
	let cleanup: (() => void) | null = null;

	const getEl = () => {
		const target = targetRef.value;
		return (target && "$el" in target ? target.$el : target) as HTMLElement | null;
	};

	const onWheel = (e: WheelEvent) => {
		const el = getEl();
		if (!el) return;
		if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			e.preventDefault();
			el.scrollLeft += e.deltaY;
		}
	};

	const onPointerDown = (e: PointerEvent) => {
		if (e.button !== 0 || e.pointerType === "touch") return;
		const el = getEl();
		if (!el) return;

		startX = e.clientX;
		startScroll = el.scrollLeft;

		const onPointerMove = (ev: PointerEvent) => {
			const dx = ev.clientX - startX;
			if (Math.abs(dx) > 5) {
				isDragging.value = true;
				el.scrollLeft = startScroll - dx;
			}
		};

		const onPointerUp = () => {
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
			cleanup = null;
			setTimeout(() => {
				isDragging.value = false;
			}, 0);
		};

		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
		cleanup = onPointerUp;
	};

	const onClickCapture = (e: MouseEvent) => {
		if (isDragging.value) {
			e.stopPropagation();
			e.preventDefault();
		}
	};

	onUnmounted(() => cleanup?.());

	return { isDragging, onWheel, onPointerDown, onClickCapture };
}
