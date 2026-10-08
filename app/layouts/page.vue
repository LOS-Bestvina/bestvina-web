<script lang="ts" setup>
</script>

<!-- do NOT move the AppHeader inside UMain, stickiness would get lost -->
<template>
	<div>
		<AppSkipLink />
		<AppHeader />
		<UMain
			id="main-content"
			class="overflow-x-clip"
			tabindex="-1"
		>
			<UContainer
				class="min-h-[calc(100vh-var(--ui-header-height))]"
			>
				<slot />
			</UContainer>
		</UMain>
		<AppFooter />
	</div>
</template>
