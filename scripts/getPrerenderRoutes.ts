import { dirname } from "path";
import { fileURLToPath } from "url";
import { CURRENT_YEAR, OLDEST_YEAR } from "../shared/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
