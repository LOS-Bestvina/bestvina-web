import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { PEOPLE_PAGES_ID_VALUES, PERSON_ROLES_ID_VALUES } from "./shared/constants";

const LinkSchema = z.object({
	label: z.string(),
	to: z.string(),
	color: z.string().optional(),
	variant: z.string().optional(),
	trailingIcon: z.string().optional(),
	leadingIcon: z.string().optional(),
});

const FeatureSchema = z.object({
	title: z.string(),
	description: z.string(),
	icon: z.string().optional(),
	image: z.string().optional(),
});

const AboutSectionSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	icon: z.string().optional(),
	image: z.string().optional(),
	images: z.array(z.string()).optional(),
	links: z.array(LinkSchema).optional(),
	mapUrl: z.string().optional(),
});

const AboutCampDataSchema = z.object({
	title: z.string(),
	description: z.string(),
	targetPeople: AboutSectionSchema.optional(),
	bestvinka: AboutSectionSchema,
	activities: AboutSectionSchema,
	schedule: z.object({
		title: z.string(),
		description: z.string().optional(),
		icon: z.string(),
		events: z.array(z.object({
			time: z.string(),
			title: z.string(),
			description: z.string().optional(),
		})),
	}),
	location: AboutSectionSchema,
	camp: AboutSectionSchema,
	stuff: AboutSectionSchema,
	accordion: z.object({
		title: z.string(),
		items: z.array(
			z.object({
				label: z.string(),
				content: z.string(),
				icon: z.string().optional(),
				defaultOpen: z.boolean().optional(),
				disabled: z.boolean().optional(),
				slot: z.string().optional(),
			}),
		),
	}).optional(),
	chemistry: AboutSectionSchema,
	biology: AboutSectionSchema,
});

const LandingPageSchema = z.object({
	hero: z.object({
		titlePrefix: z.string(),
		titleMain: z.string(),
		description: z.string(),
		links: z.array(LinkSchema),
	}),
	reasons: z.object({
		title: z.string(),
		features: z.array(FeatureSchema),
	}),
	activities: AboutSectionSchema,
	location: AboutSectionSchema,
	people: AboutSectionSchema,
});

const YearsPageSchema = z.object({
	year: z.number().int(),
	coverImg: z.string().nullable().optional(), // path to image
	theme: z.string().nullable().optional(),

	term: z.object({
		startDate: z.date(),
		endDate: z.date(),
		note: z.string().optional(),
	}).optional(),

	pricing: z.object({
		price: z.number().int().optional(),
		note: z.string().optional(),
		additionalInfo: z.string().optional(),
	}).optional(),

	registration: z.object({
		links: z.array(z.object({
			url: z.string(),
			text: z.string(),
			color: z.string().optional(),
			icon: z.string().optional(),
		})).optional(),
		deadline: z.union([z.date(), z.string()]),
		note: z.string().optional(),
	}).optional(),

	infoCards: z.array(z.object({
		title: z.string(),
		icon: z.string().optional(),
		description: z.string().optional(),
		color: z.string().optional(),
		links: z.array(z.object({
			url: z.string(),
			text: z.string(),
			color: z.string().optional(),
			icon: z.string().optional(),
		})).optional(),
	})).optional(),
});

export default defineContentConfig({
	collections: {
		landing: defineCollection({
			type: "data",
			source: "landing.json",
			schema: LandingPageSchema,
		}),

		years: defineCollection({
			source: "years/**.(yml|md)",
			type: "page",
			schema: YearsPageSchema,
		}),

		people: defineCollection({
			type: "data",
			source: "people/individuals/**/*.md",
			schema: z.object({
				name: z.string(),
				nickname: z.string().optional(),
				degreesBeforeName: z.string().optional(),
				degreesAfterName: z.string().optional(),
				description: z.string().optional(),
				image: z.string().optional(),
				isFormer: z.boolean().catch(false),
				isHidden: z.boolean().catch(false),
				// ... other fields (to be added later) ...
				pages: z.record(
					z.enum(PEOPLE_PAGES_ID_VALUES),
					z.object({
						role: z.enum(PERSON_ROLES_ID_VALUES).optional(),
						roleTitle: z.string().optional(),
						description: z.string().optional(),
						name: z.string().optional(),
						image: z.string().optional(),
						nickname: z.string().optional(),
					}),
				),
			}),
		}),

		peoplePages: defineCollection({
			type: "data",
			source: `people/**/*.json`,
			schema: z.object({
				title: z.string().optional(),
				description: z.string().optional(),
				header: z.string().optional(),
				headerText: z.string().optional(),
				sections: z.array(
					z.object({
						name: z.string().optional(),
						description: z.string().optional(),
						people: z.array(z.string()),
						showImages: z.boolean().catch(true),
					}),
				),
			}),
		}),

		aboutCampPage: defineCollection({
			type: "page",
			source: "about_camp/*",
			schema: AboutCampDataSchema,
		}),

		contacts: defineCollection({
			type: "data",
			source: "contacts.json",
			schema: z.object({
				contacts: z.array(z.object({
					name: z.string(),
					role: z.string(),
					organization: z.string().optional(),
					img: z.string().optional(),
					email: z.string(),
					icon: z.string().optional(),
					address: z.string().optional(),
				})),
			}),
		}),
	},
});
