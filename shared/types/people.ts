import type { PeopleCollectionItem, PeopleStructureCollectionItem } from "@nuxt/content";

export type PersonOverride = NonNullable<PeopleCollectionItem["overrides"]>[string];

export type PeopleCollectionItemExtended = PeopleCollectionItem & {
	id: string;
	role?: string;
};

export type SectionManifest = PeopleStructureCollectionItem;
export type SectionManifestSection = NonNullable<PeopleStructureCollectionItem["sections"]>[number];

