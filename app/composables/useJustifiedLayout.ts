import type { BestvinaImage } from "#shared/utils/imageMapper";

export interface LayoutImage {
	image: BestvinaImage;
	width: number;
}

// LayoutItems now include the absolute `top` Y-coordinate
export type LayoutItem
	= | { type: "header"; id: string; year: string; height: number; top: number }
		| { type: "row"; id: string; height: number; top: number; items: LayoutImage[] };

export interface JustifiedLayoutOptions {
	targetHeight?: number;
	gap?: number;
	headerHeight?: number;
	hideHeaders?: boolean;
}

export default function (
	groupedImages: Ref<Record<string, BestvinaImage[]>>,
	containerWidth: Ref<number>,
	options: MaybeRefOrGetter<JustifiedLayoutOptions> = { },
) {
	return computed(() => {
		const optionsValue = toValue(options);

		const layout: LayoutItem[] = [];
		const width = containerWidth.value;

		if (width <= 0) return { layoutItems: [], totalHeight: 0 };

		const targetHeight = optionsValue.targetHeight ?? 250;
		const gap = optionsValue.gap ?? 8;
		const headerHeight = optionsValue.headerHeight ?? 80;

		const years = Object.keys(groupedImages.value).sort((a, b) => Number(b) - Number(a));

		let currentY = 0; // Running tally of the Y-coordinate

		for (const year of years) {
			const images = groupedImages.value[year];

			if (!optionsValue.hideHeaders) {
				// 1. Push Header
				layout.push(markRaw({
					type: "header", id: `header-${year}`, year,
					height: headerHeight, top: currentY,
				}));
				currentY += headerHeight;
			}

			let currentRow: BestvinaImage[] = [];
			let currentRowAspectRatioSum = 0;

			const commitRow = (rowItems: BestvinaImage[], finalHeight: number) => {
				layout.push(markRaw({
					type: "row", id: `row-${year}-${layout.length}`,
					height: finalHeight, top: currentY,
					items: rowItems.map(img => markRaw({
						image: img, width: img.aspectRatio * finalHeight,
					})),
				}));
				currentY += finalHeight + gap;
			};

			// TODO: check ?? []
			for (const img of images ?? []) {
				const nextAspectRatioSum = currentRowAspectRatioSum + img.aspectRatio;
				const widthWithImg = (nextAspectRatioSum * targetHeight) + (currentRow.length * gap);

				if (widthWithImg < width) {
					currentRow.push(img);
					currentRowAspectRatioSum = nextAspectRatioSum;
				}
				else {
					const targetWidthBefore = width - (Math.max(0, currentRow.length - 1) * gap);
					const heightBefore = targetWidthBefore / currentRowAspectRatioSum;
					const errorBefore = Math.abs(heightBefore - targetHeight);

					const targetWidthAfter = width - (currentRow.length * gap);
					const heightAfter = targetWidthAfter / nextAspectRatioSum;
					const errorAfter = Math.abs(heightAfter - targetHeight);

					if (errorBefore < errorAfter || currentRow.length === 0) {
						commitRow([...currentRow], heightBefore);
						currentRow = [img];
						currentRowAspectRatioSum = img.aspectRatio;
					}
					else {
						currentRow.push(img);
						commitRow([...currentRow], heightAfter);
						currentRow = [];
						currentRowAspectRatioSum = 0;
					}
				}
			}

			// 3. Commit Final Row
			if (currentRow.length > 0) {
				const naturalWidth = (currentRowAspectRatioSum * targetHeight) + ((currentRow.length - 1) * gap);
				if (naturalWidth > width * 0.75) {
					const height = (width - ((currentRow.length - 1) * gap)) / currentRowAspectRatioSum;
					commitRow(currentRow, height);
				}
				else {
					commitRow(currentRow, targetHeight);
				}
			}

			if (!optionsValue.hideHeaders) {
				currentY += 24;
			}
		}

		return { layoutItems: layout, totalHeight: currentY };
	});
};
