import { mkdir, readdir, writeFile } from "fs/promises";
import { relative, resolve } from "path";
import { join } from "path/posix";
import { IMAGE_EXTENSIONS } from "./shared/constants";

const imgsDir: string = "public/imgs";
const outputDir: string = ".prerender";
const routesFilename: string = "imgs-routes.json";

interface PrerenderRule {
	patterns: string[];
	presets: string[];
}

const PRESET_RULES: PrerenderRule[] = [
	{
		patterns: ["**/gallery/**"],
		presets: ["thumbnailXXSm", "thumbnailSm", "thumbnailMd", "thumbnailXLg", "thumbnailXXLg"],
	},
	{
		patterns: ["**/groups/**"],
		presets: ["thumbnailXXSm", "thumbnailSm", "thumbnailLg", "thumbnailXXLg"],
	},
	{
		patterns: ["**/people/**"],
		presets: ["thumbnailXXSm", "thumbnailMd", "thumbnailLg", "thumbnailXXLg"],
	},
	{
		patterns: ["**/promo/**"],
		presets: ["thumbnailXXSm", "thumbnailMd", "thumbnailXLg", "thumbnailXXLg"],
	},
];

const DEFAULT_PRESETS = ["thumbnailXXSm", "thumbnailMd"];

const PRESET_MAP: Record<string, string> = {
	thumbnailXXSm: "w_20",
	thumbnailSm: "w_240&q_50",
	thumbnailMd: "w_480&q_50",
	thumbnailLg: "w_720&q_50",
	thumbnailXLg: "w_1080&q_50",
	thumbnailXXLg: "w_1920&q_50",
};

/**
 * Converts a glob-like pattern to a Regular Expression.
 */
function patternToRegex(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const regexString = escaped
		.replace(/\*\*/g, ".+") // ** any chars
		.replace(/\*/g, "[^/]+"); // * any chars except slash
	return new RegExp(`^${regexString}$`);
}

async function getAllImages(dir: string, recursively: boolean = true) {
	const entries = await readdir(resolve(dir), { withFileTypes: true, recursive: recursively });
	const images: string[] = [];

	entries.forEach((entry) => {
		const posixPathWithoutPublic = relative(resolve("public"), entry.parentPath).replace(/\\/g, "/");
		const extension = entry.name.substring(entry.name.lastIndexOf(".") + 1).toLowerCase();
		if (entry.isFile() && IMAGE_EXTENSIONS.includes(extension)) {
			images.push(join(posixPathWithoutPublic, entry.name));
		}
	});
	return images;
}

function getImgsRoutes(images: string[]): string[] {
	const routes: string[] = [];

	// pre-compile patterns to avoid redundant overhead
	const compiledRules = PRESET_RULES.map(rule => ({
		regexes: rule.patterns.map(patternToRegex),
		presets: rule.presets,
	}));

	images.forEach((image) => {
		// find the first rule that matches any of its patterns
		const matchingRule = compiledRules.find(rule =>
			rule.regexes.some(regex => regex.test(image)),
		);

		const presets = matchingRule ? matchingRule.presets : DEFAULT_PRESETS;

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
