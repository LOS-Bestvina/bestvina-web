import type { PeopleCollectionItem } from "@nuxt/content";

export type PeopleCollectionItemExtended = PeopleCollectionItem & {
	id: string;
	roleTitle?: string;
	role?: string;
};
