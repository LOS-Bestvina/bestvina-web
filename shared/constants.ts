/**
 * GENERAL CONSTNANTS
 */
export const OLDEST_YEAR = 2010; // should not be changed, unless new history was uncovered

export const CURRENT_YEAR = 2026;

export const PATHS = {
	PEOPLE_INDIVIDUALS_STEM: "people/individuals/",
	PEOPLE_STRUCTURE_STEM: "people/structure/",
	PEOPLE_STRUCTURE_JSON_PATH: "people/structure/**/*.json",
	PEOPLE_INDIVIDUALS_GLOB: "people/individuals/**/*.md",
	CONTACTS_JSON: "contacts.json",
	YEARS_GLOB: "years/**.(yml|md)",
	ABOUT_CAMP_GLOB: "about_camp/*",
	LANDING_JSON: "landing.json",
	IMAGE_PATH: (year: string, type: string, file: string) => `/imgs/years/${year}/${type}/${file}`,
} as const;

/**
 * DATA-PROCESSING-related CONSTANTS
 * */
export const IMAGE_EXTENSIONS = ["jpg", "png", "gif", "jpeg", "webp"];



export const ACTIVE_ORGANIZER_ROUTES = [
	"/lide",
	"/lide/vsichni",
	"/lide/chemie",
	"/lide/biologie",
	"/lide/ostatni",
] as const;

