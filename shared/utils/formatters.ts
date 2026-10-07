export function formatFileSize(bytes?: number | null): string | null {
	if (!bytes || bytes <= 0) return null;

	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${Math.round(bytes / 1024)} kB`;
	}

	return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;
}

export function formatResolution(width?: number | null, height?: number | null): string | null {
	if (!width || !height || width <= 0 || height <= 0) return null;
	const mpx = (width * height) / 1_000_000;
	return `${Number(mpx.toFixed(1))} Mpx`;
}
