import { usePreferredReducedMotion } from "@vueuse/core";

const preferredReducedMotion = usePreferredReducedMotion();
export const getCarouselAutoplayOptions = (delay: number) => {
	if (preferredReducedMotion.value === "reduce") {
		return false;
	}
	return {
		delay,
		stopOnInteraction: false,
		stopOnMouseEnter: true,
		stopOnFocusIn: true,
	};
};
