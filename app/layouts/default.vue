<template>
	<div>
		<AppSkipLink />
		<AppHeader />
		<UMain
			id="main-content"
			tabindex="-1"
		>
			<slot />
		</UMain>
		<AppFooter />
	</div>
</template>
