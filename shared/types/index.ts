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
