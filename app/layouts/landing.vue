<script setup lang="ts">
</script>

<template>
	<div>
		<AppHeader />
		<!-- make the page fill windows height even if there is not enough content -->
		<UMain class="min-h-(--my-page-height)">
			<slot />
		</UMain>

		<AppFooter />
	</div>
</template>
