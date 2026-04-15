import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { CURRENT_YEAR, OLDEST_YEAR } from "../shared/constants";

export const getApiRoutesToPrerender = (): string[] => {
	const apiRoutes: string[] = [];

	for (let year = OLDEST_YEAR; year <= CURRENT_YEAR; year++) {
		apiRoutes.push(`/api/v1/images/gallery/${year}`);
		apiRoutes.push(`/api/v1/images/groups/${year}`);
	}

	// global API endpoints
	apiRoutes.push(`/api/v1/images/years`);
	apiRoutes.push(`/api/v1/images/photographers`);

	return apiRoutes;
};

export const getImgRoutes = (): string[] => {
	const imgsRoutesPath = resolve(".prerender/imgs-routes.json");
	if (!existsSync(imgsRoutesPath)) {
		throw new Error("File ./prerender/imgs-routes.json not found. You need to run `npm run prerender` first.");
	}
	try {
		return JSON.parse(readFileSync(imgsRoutesPath, "utf-8"));
	}
	catch (error) {
		throw new Error(`Getting imgs routes failed: ${error}`);
	}
};
