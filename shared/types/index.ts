export * from "./ids";
export * from "./people";
export * from "./photographer";

export interface ImageMetadata {
	path: string;
	title?: string;
	year?: string;
	author?: string;
}

export type GroupedImages = Record<string, ImageMetadata[]>;

export const IMAGE_TYPES = ["gallery", "groups"] as const;

export type ImageType = (typeof IMAGE_TYPES)[number];