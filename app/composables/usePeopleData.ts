import { toValue } from "vue";
import type { PeoplePageId } from "#shared/constants";
import type { PeopleCollectionItem } from "@nuxt/content";
import type { PeopleCollectionItemExtended } from "#shared/types/people";

export default function () {
	/**
	 * INTERNAL METHODS
	 */

	const getCleanId = (userId: MaybeRefOrGetter<string>) => {
		const val = toValue(userId);
		return val ? val.replace(/^\/+/, "") : "";
	};

	const getPageSpecificOrDefaultPersonData = (person: PeopleCollectionItem, pageId: string) => {
		if (!person.pages)
			return person as PeopleCollectionItemExtended;

		const pageIdInRecord = pageId.replace("/", "_");
		const selectedPagePersonData = person.pages?.[pageIdInRecord];

		if (selectedPagePersonData) {
			const extendedPerson = { ...person } as PeopleCollectionItemExtended;
			extendedPerson.name = selectedPagePersonData.name || person.name;
			extendedPerson.description = selectedPagePersonData.description || person.description;
			extendedPerson.nickname = selectedPagePersonData.nickname || person.nickname;
			extendedPerson.image = selectedPagePersonData.image || person.image;
			extendedPerson.roleTitle = selectedPagePersonData.roleTitle;
			extendedPerson.role = selectedPagePersonData.role;
			return extendedPerson;
		}
		return person as PeopleCollectionItemExtended;
	};

	const getAllPeopleRaw = async () => {
		const people = await queryCollection("people").all();

		// add `id` calculated property
		return people.map(person => ({
			...person,
			id: person.stem.replace("people/individuals/", ""),
		}));
	};

	/**
	 * EXPORTED METHODS
	 * */

	const getPageData = (pageId: MaybeRefOrGetter<string>) => {
		return useAsyncData(
			`page-data-${toValue(pageId)}`,
			() => {
				return queryCollection("peoplePages")
					.where("stem", "=", `people/${toValue(pageId)}`)
					.first();
			},
			{
				watch: [() => toValue(pageId)],
			},
		);
	};

	const getPerson = (personId: MaybeRefOrGetter<string>) => {
		return useAsyncData(
			`person-${getCleanId(personId)}`,
			() => {
				return queryCollection("people")
					.where("stem", "=", `people/individuals/${getCleanId(personId)}`)
					.first();
			},
			{
				watch: [() => toValue(personId)],
			},
		);
	};

	const getAllPeople = () => {
		return useAsyncData("people-data", async () => {
			return await getAllPeopleRaw();
		});
	};

	const getAllActivePeopleSortedForPage = (pageId: MaybeRefOrGetter<PeoplePageId>) => {
		return useAsyncData(`all-people-data-sorted-${toValue(pageId)}`, async () => {
			const peopleRaw = await getAllPeopleRaw();
			return peopleRaw
				.filter(person => !person.isFormer && !person.isHidden && !person.pages?.externi)
				.map(person => getPageSpecificOrDefaultPersonData(person, toValue(pageId)))
				.sort((a, b) => a.name.localeCompare(b.name));
		});
	};

	const getAllFormerPeopleSorted = (formerPageId: MaybeRefOrGetter<PeoplePageId>) => {
		return useAsyncData("all-former-people-data-sorted", async () => {
			const peopleRaw = await queryCollection("people")
				.where("isFormer", "=", true)
				.where("isHidden", "=", false)
				.all();
			try {
				return peopleRaw
					.map(person => getPageSpecificOrDefaultPersonData(person, toValue(formerPageId)))
					.sort((a, b) => a.name.localeCompare(b.name));
			}
			catch (e) {
				console.error(e);
				return [];
			}
		});
	};

	const getAllPages = () => {
		return useAsyncData("people-pages", async () => {
			const pages = await queryCollection("peoplePages").all();
			// add `id` calculated property
			return pages.map(page => ({
				...page,
				id: page.stem.replace("people/", ""),
			}));
		});
	};

	// return only active people
	const getPopulatedPageData = (pageId: MaybeRefOrGetter<string>) => {
		return useAsyncData(
			`populated-page-data-${toValue(pageId)}`,
			async () => {
				const page = await queryCollection("peoplePages")
					.where("stem", "=", `people/${toValue(pageId)}`)
					.first();

				const people = await queryCollection("people").all();
				if (!page || !people) {
					return null;
				}
				const peopleMap = new Map(
					people
						.filter(person => !person.isFormer && !person.isHidden)
						.map((person) => {
							const id = person.stem.replace("people/individuals/", "");
							const newPersonData = getPageSpecificOrDefaultPersonData({ ...person, id }, toValue(pageId));
							return [id, newPersonData];
						}),
				);

				return {
					...page,
					id: page.stem.replace("people/", ""),
					sections: page.sections?.map(section => ({
						...section,
						people: section.people
							?.map(personId => peopleMap.get(personId))
							.filter(person => !!person),
					})) || [],
				};
			},
			{
				watch: [() => toValue(pageId)],
			},
		);

		// TODO: check if person's image exists
	};

	return {
		getPageData,
		getAllPages,
		getPopulatedPageData,

		getPerson,
		getAllPeople,
		getAllActivePeopleSortedForPage,
		getAllFormerPeopleSorted,
	};
}
