import type { PeopleCollectionItemExtended, PersonOverride } from "../types/people";

/**
 * Resolves a person's display data based on the following cascade:
 * 1. overrides[subsectionId]
 * 2. overrides[tabId]
 * 3. top-level attributes
 */
export function resolvePersonForContext(
	person: PeopleCollectionItemExtended,
	tabId?: string,
	subsectionId?: string,
): PeopleCollectionItemExtended {
	const overrides = person.overrides;
	const subOverride: PersonOverride | undefined = subsectionId && overrides ? overrides[subsectionId] : undefined;
	const tabOverride: PersonOverride | undefined = tabId && overrides ? overrides[tabId] : undefined;

	return {
		...person,
		roleTitle: subOverride?.roleTitle ?? tabOverride?.roleTitle ?? person.roleTitle,
		description: subOverride?.description ?? tabOverride?.description ?? person.description,
		name: subOverride?.name ?? tabOverride?.name ?? person.name,
		nickname: subOverride?.nickname ?? tabOverride?.nickname ?? person.nickname,
		image: subOverride?.image ?? tabOverride?.image ?? person.image,
		role: subOverride?.role ?? tabOverride?.role ?? person.role,
	};
}
