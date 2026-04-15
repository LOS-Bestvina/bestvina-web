import { mkdir, readdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { join } from "path/posix";
import { IMAGE_EXTENSIONS } from "./shared/constants";

const imgsDir: string = "public/imgs";
const outputDir: string = ".prerender";
const routesFilename: string = "imgs-routes.json";

const CONFIG: Record<string, string[]> = {
	gallery: ["thumbnailXXSm", "thumbnailSm", "thumbnailMd", "thumbnailXLg", "thumbnailXXLg", "original"],
	groups: ["thumbnailXXSm", "thumbnailSm", "thumbnailLg", "thumbnailXXLg", "original"],
	team: ["thumbnailXXSm", "thumbnailMd", "thumbnailLg", "thumbnailXXLg", "original"],
	promo: ["thumbnailXXSm", "thumbnailMd", "thumbnailXLg", "thumbnailXXLg", "original"],
	default: ["thumbnailXXSm", "thumbnailMd", "original"],
};

const PRESET_MAP: Record<string, string> = {
	thumbnailXXSm: "w_20",
	thumbnailSm: "w_240&q_50",
	thumbnailMd: "w_480&q_50",
	thumbnailLg: "w_720&q_50",
	thumbnailXLg: "w_1080&q_50",
	thumbnailXXLg: "w_1920&q_50",
	original: "_",
};

async function getAllImages(dir: string, recursively: boolean = true) {
	const entries = await readdir(resolve(dir), { withFileTypes: true, recursive: recursively });
	const images: string[] = [];

	entries.forEach((entry) => {
		const posixParentPath = entry.parentPath.replace(/\\/g, "/");
		const imgsIndex = posixParentPath.indexOf("imgs");
		const posixPathWithoutPublic = posixParentPath.substring(imgsIndex);
		const extension = entry.name.substring(entry.name.lastIndexOf(".") + 1).toLowerCase();
		if (entry.isFile() && IMAGE_EXTENSIONS.includes(extension)) {
			images.push(join(posixPathWithoutPublic, entry.name));
		}
	});
	return images;
}

function getImgsRoutes(images: string[]): string[] {
	const routes: string[] = [];

	images.forEach((image) => {
		// Identify folder from path (e.g., imgs/years/2026/gallery/img.jpg -> gallery)
		const parts = image.split("/");
		let folderKey = "default";

		if (parts.includes("gallery")) folderKey = "gallery";
		else if (parts.includes("groups")) folderKey = "groups";
		else if (parts.includes("team")) folderKey = "team";
		else if (parts.includes("promo")) folderKey = "promo";

		const presets = CONFIG[folderKey] || CONFIG.default;

		presets.forEach((preset) => {
			const ipxSegment = PRESET_MAP[preset];
			if (ipxSegment) {
				routes.push(`/_ipx/${ipxSegment}/${image}`);
			}
		});
	});

	return routes;
}

async function writeRoutesToFile(routes: string[], outDir: string, filename: string) {
	await mkdir(resolve(outDir), { recursive: true });
	await writeFile(
		resolve(outDir, filename),
		JSON.stringify(routes.map(it => it.replace(/\\/g, "/")), null, 2),
	);
}

async function generateImgsRoutes(inDir: string, outDir: string, outFilename: string) {
	try {
		const imgs = await getAllImages(inDir);
		const routes = getImgsRoutes(imgs);
		await writeRoutesToFile(routes, outDir, outFilename);
		console.log(`${routes.length} image routes generated to ${outDir}/${outFilename}`);
	}
	catch (e) {
		console.error("Error generating imgs routes:", e);
	}
}

generateImgsRoutes(imgsDir, outputDir, routesFilename);
