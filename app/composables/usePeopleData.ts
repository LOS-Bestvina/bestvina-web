import { toValue } from "vue";
import type { PeoplePageId } from "#shared/constants";
import type { PeopleCollectionItemExtended } from "#shared/types/people";
import { resolvePersonForContext } from "#shared/utils/peopleResolver";

export default function () {
	const normalizePageId = (pageId: MaybeRefOrGetter<string>) => {
		return toValue(pageId).replace(/^aktivni\//, "");
	};

	const getAllPeopleRaw = async () => {
		const people = await queryCollection("people").all();
		return people
			.filter(person => !person.stem.split("/").pop()?.startsWith("_"))
			.map(person => ({
				...person,
				id: person.stem.replace("people/individuals/", ""),
			})) as PeopleCollectionItemExtended[];
	};

	/**
	 * Fetch raw manifest data for header/SEO metadata
	 */
	const getPageData = (pageId: MaybeRefOrGetter<string>) => {
		const cleanId = normalizePageId(pageId);
		return useAsyncData(
			`page-data-${cleanId}`,
			() => {
				return queryCollection("peopleStructure")
					.where("stem", "=", `people_structure/${cleanId}`)
					.first();
			},
			{
				watch: [() => toValue(pageId)],
			},
		);
	};

	/**
	 * Fetch populated section manifest with resolved contextual instructor data
	 */
	const getPopulatedPageData = (pageId: MaybeRefOrGetter<string>) => {
		const cleanId = normalizePageId(pageId);
		return useAsyncData(
			`populated-page-data-${cleanId}`,
			async () => {
				const manifest = await queryCollection("peopleStructure")
					.where("stem", "=", `people_structure/${cleanId}`)
					.first();

				const people = await getAllPeopleRaw();
				if (!manifest || !people) {
					return null;
				}

				const peopleMap = new Map(
					people
						.filter(person => !person.isFormer && !person.isHidden)
						.map(person => [person.id, person]),
				);

				return {
					...manifest,
					id: manifest.id || cleanId,
					sections: manifest.sections?.map(section => ({
						...section,
						people: section.people
							?.map((personId) => {
								const cleanPersonId = personId.includes("/")
									? personId.split("/").pop()!
									: personId;
								const rawPerson = peopleMap.get(cleanPersonId);
								if (!rawPerson) return null;
								return resolvePersonForContext(
									rawPerson,
									cleanId,
									section.id,
								);
							})
							.filter((p): p is PeopleCollectionItemExtended => p !== null),
					})) || [],
				};
			},
			{
				watch: [() => toValue(pageId)],
			},
		);
	};

	/**
	 * Sorted active people for alphabetical directory (All / Všichni)
	 */
	const getAllActivePeopleSortedForPage = (pageId: MaybeRefOrGetter<PeoplePageId | string>) => {
		const cleanId = normalizePageId(pageId);
		return useAsyncData(`all-people-data-sorted-${cleanId}`, async () => {
			const peopleRaw = await getAllPeopleRaw();
			return peopleRaw
				.filter(person => !person.isFormer && !person.isHidden && !person.isExternal)
				.map(person => resolvePersonForContext(person, cleanId))
				.sort((a, b) => a.name.localeCompare(b.name));
		});
	};

	/**
	 * Sorted former people
	 */
	const getAllFormerPeopleSorted = (formerPageId: MaybeRefOrGetter<PeoplePageId | string>) => {
		const cleanId = normalizePageId(formerPageId);
		return useAsyncData(`all-former-people-data-sorted-${cleanId}`, async () => {
			const peopleRaw = await getAllPeopleRaw();
			return peopleRaw
				.filter(person => person.isFormer && !person.isHidden)
				.map(person => resolvePersonForContext(person, cleanId))
				.sort((a, b) => a.name.localeCompare(b.name));
		});
	};

	return {
		getPageData,
		getPopulatedPageData,
		getAllActivePeopleSortedForPage,
		getAllFormerPeopleSorted,
		resolvePersonForContext,
	};
}
