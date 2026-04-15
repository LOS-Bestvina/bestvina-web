export default defineAppConfig({
	ui: {
		colors: {
			primary: "teal",
			secondary: "orange",
			tertiary: "yellow",
			neutral: "zinc",
		},
		container: {
			base: "w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8",
		},
		theme: {
			radius: 0.5,
		},
		pageHeader: {
			slots: {
				root: "relative w-screen ml-[-50vw] left-[50%] px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center border-none",
				container: "flex flex-col items-center w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8",
				wrapper: "flex flex-col items-center max-w-2xl mx-auto",
				title: "text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--ui-text-highlighted)]",
				description: "mt-4 text-lg sm:text-xl text-[var(--ui-text-muted)] max-w-2xl",
				links: "justify-center mt-6",
				headline: "justify-center",
			},
		},
		navigationMenu: {
			variants: {
				orientation: {
					vertical: {
						item: "py-1",
						link: "py-2 text-base",
						label: "text-base",
						linkLeadingIcon: "size-8",
						childItem: "py-1",
						childLink: "py-2",
					},
				},
			},
		},
		card: {
			slots: {
				root: "bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md ring-1 ring-neutral-200 dark:ring-white/5 shadow-sm transition-all duration-300",
			},
		},
		tabs: {
			slots: {
				root: "flex flex-col gap-2",
				list: "bg-neutral-100/50 dark:bg-neutral-800/50 backdrop-blur-md ring-1 ring-neutral-200/10 dark:ring-white/5 p-1",
				indicator: "hidden md:block bg-secondary-500 rounded-lg shadow-sm",
				trigger: "transition-all duration-200 font-medium px-4 py-1.5 text-sm cursor-pointer data-[state=active]:bg-secondary-500 md:data-[state=active]:bg-transparent data-[state=active]:text-white text-muted hover:text-highlighted z-10",
			},
		},
	},
	toaster: {
		position: "bottom-right" as const,
		expand: true,
		duration: 5000,
		max: 3,
	},
	seo: {
		siteName: "Běstvina",
	},
});
