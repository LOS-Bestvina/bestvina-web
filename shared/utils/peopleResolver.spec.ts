import { describe, expect, it } from "bun:test";
import { resolvePersonForContext } from "./peopleResolver";
import type { PeopleCollectionItemExtended } from "../types/people";

describe("resolvePersonForContext", () => {
	const basePerson = {
		id: "kotek_jan",
		stem: "people/individuals/kotek_jan",
		name: "Jan Kotek",
		nickname: "Honza",
		roleTitle: "Přednášející anorganické chemie",
		description: "7 pádů Honzy Kotka.",
		image: "/imgs/people/individuals/vedeni/kotek_jan.jpg",
		isFormer: false,
		isHidden: false,
		isExternal: false,
	} as unknown as PeopleCollectionItemExtended;

	it("falls back to top-level person defaults when no overrides exist", () => {
		const resolved = resolvePersonForContext(basePerson, "chemie", "chemie_prednasejici");
		expect(resolved.roleTitle).toBe("Přednášející anorganické chemie");
		expect(resolved.description).toBe("7 pádů Honzy Kotka.");
	});

	it("applies tab-level override when present and no subsection override exists", () => {
		const personWithTabOverride: PeopleCollectionItemExtended = {
			...basePerson,
			overrides: {
				vedeni: {
					roleTitle: "Hlavní vedoucí (HV)",
					description: "Popis pro vedení tábora.",
				},
			},
		};

		const resolved = resolvePersonForContext(personWithTabOverride, "vedeni", "vedeni_hlavni");
		expect(resolved.roleTitle).toBe("Hlavní vedoucí (HV)");
		expect(resolved.description).toBe("Popis pro vedení tábora.");
	});

	it("applies subsection override over tab override and defaults", () => {
		const personWithBothOverrides: PeopleCollectionItemExtended = {
			...basePerson,
			overrides: {
				chemie: {
					roleTitle: "Chemik obecný",
				},
				chemie_laborator: {
					roleTitle: "Vedoucí laboratoře",
				},
			},
		};

		const resolved = resolvePersonForContext(personWithBothOverrides, "chemie", "chemie_laborator");
		expect(resolved.roleTitle).toBe("Vedoucí laboratoře");
		// description was not overridden in subsection or tab, should fall back to default
		expect(resolved.description).toBe("7 pádů Honzy Kotka.");
	});

	it("falls back to tab override if subsection override does not define that specific field", () => {
		const person: PeopleCollectionItemExtended = {
			...basePerson,
			overrides: {
				chemie: {
					roleTitle: "Přednášející",
					description: "Tab popis",
				},
				chemie_prednasejici: {
					roleTitle: "Přednášející biofyzikální chemie",
					// description left undefined
				},
			},
		};

		const resolved = resolvePersonForContext(person, "chemie", "chemie_prednasejici");
		expect(resolved.roleTitle).toBe("Přednášející biofyzikální chemie");
		expect(resolved.description).toBe("Tab popis");
	});

	it("correctly handles person with multiple roles in different contexts without mutating original object", () => {
		const instructor: PeopleCollectionItemExtended = {
			...basePerson,
			roleTitle: "Přednášející organické chemie",
			overrides: {
				vedeni: {
					roleTitle: "Programový vedoucí chemické sekce",
				},
			},
		};

		const inChemistry = resolvePersonForContext(instructor, "chemie", "chemie_prednasejici");
		const inLeadership = resolvePersonForContext(instructor, "vedeni", "vedeni_hlavni");

		expect(inChemistry.roleTitle).toBe("Přednášející organické chemie");
		expect(inLeadership.roleTitle).toBe("Programový vedoucí chemické sekce");
		expect(instructor.roleTitle).toBe("Přednášející organické chemie");
	});
});
