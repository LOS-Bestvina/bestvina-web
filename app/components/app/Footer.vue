<script lang="ts" setup>
</script>

<template>
	<UFooter class="bg-black">
		<template #left>
			<div class="flex flex-col items-start gap-4">
				<NuxtLink
					class="flex items-center"
					to="/"
				>
					<NuxtImg
						alt="Běstvina Logo"
						class="h-16 object-contain"
						src="/imgs/b-logo.svg"
					/>
				</NuxtLink>
				<div class="flex flex-col items-start gap-1">
					<p class="text-sm text-muted">
						Našli jste na webu nějakou chybu?
						<NuxtLink
							class="text-white hover:text-secondary underline underline-offset-4"
							to="/kontakt#spravce-webove-stranky"
						>Napiš správci</NuxtLink>
						nebo založ
						<NuxtLink
							class="text-white hover:text-secondary underline underline-offset-4"
							rel="noopener noreferrer"
							target="_blank"
							to="https://github.com/LOS-Bestvina/bestvina-web/issues"
						>
							Issue na GitHubu
						</NuxtLink>.
					</p>
					<NuxtLink
						class="my-2 text-xs text-muted hover:text-muted transition-colors"
						rel="noopener noreferrer"
						target="_blank"
						to="https://github.com/LOS-Bestvina/bestvina-web"
					>
						Zdrojový kód je dostupný na <span class="text-white hover:text-secondary">GitHubu</span>
					</NuxtLink>
				</div>
			</div>
		</template>

		<template #center />

		<template #right>
			<div class="flex items-center gap-2">
				<UButton
					aria-label="Web chemické olympiády"
					class="text-white light:hover:bg-elevated/20 dark:hover:bg-elevated hover:text-secondary"
					color="neutral"
					icon="i-carbon-chemistry"
					label="Chemická olympiáda"
					rel="noopener noreferrer"
					size="sm"
					target="_blank"
					to="https://olympiada.vscht.cz/"
					variant="link"
				/>

				<UButton
					aria-label="Web biologické olympiády"
					class="text-white light:hover:bg-elevated/20 dark:hover:bg-elevated hover:text-secondary"
					color="neutral"
					icon="i-material-symbols-microbiology-outline"
					label="Biologická olympiáda"
					rel="noopener noreferrer"
					size="sm"
					target="_blank"
					to="https://olympiada.natur.cuni.cz/cs/"
					variant="ghost"
				/>
			</div>
		</template>
	</UFooter>
</template>
