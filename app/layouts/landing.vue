<script setup lang="ts">
</script>

<template>
	<div>
		<AppSkipLink />
		<AppHeader />
		<!-- make the page fill windows height even if there is not enough content -->
		<UMain
			id="main-content"
			class="min-h-(--my-page-height)"
			tabindex="-1"
		>
			<slot />
		</UMain>

		<AppFooter />
	</div>
</template>
