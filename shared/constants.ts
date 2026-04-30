/**
 * GENERAL CONSTNANTS
 */
export const OLDEST_YEAR = 2010; // should not be changed, unless new history was uncovered

export const CURRENT_YEAR = 2026;

export const PATHS = {
	PEOPLE_INDIVIDUALS_STEM: "people/individuals/",
	PEOPLE_PAGES_STEM: "people/",
	PEOPLE_JSON_PATH: "people/**/*.json",
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

/**
 * PEOPLE-related CONSTANTS
 */
export const PERSON_ROLES = {
	LECTURER: "prednasejici",
	LAB_RAT: "laborant",
	GUEST: "host",
	MEDIC: "zdravotnik",
	ADMINISTRATIVE: "administrativa",
	OTHER: "ostatni",
};
export type PersonRoleId = typeof PERSON_ROLES[keyof typeof PERSON_ROLES];
export const PERSON_ROLES_ID_VALUES = Object.values(PERSON_ROLES) as [string, ...string[]];

export const PERSON_BADGES = {
	LEADERSHIP: "vedeni",
	LECTURER: "lecturer",
	CHEM_LAB: "chlab",
	BIO_LAB: "biolab",
	BIO_TENT: "biostan",
	OTHER: "jine",
};

/**
 * PEOPLE-SECTIONS-related CONSTANTS
 */
export const PEOPLE_PAGES = {
	LEADERSHIP: "vedeni",
	EXTERNAL: "externi",
	FORMER: "byvali",
	ACTIVE: "aktivni",
	ACTIVE_ALL: "aktivni_vsichni",
	ACTIVE_CHEMISTRY: "aktivni_chemie",
	ACTIVE_BIOLOGY: "aktivni_biologie",
	ACTIVE_OTHER: "aktivni_ostatni",
};
export type PeoplePageId = typeof PEOPLE_PAGES[keyof typeof PEOPLE_PAGES];
export const PEOPLE_PAGES_ID_VALUES = Object.values(PEOPLE_PAGES) as [string, ...string[]];
