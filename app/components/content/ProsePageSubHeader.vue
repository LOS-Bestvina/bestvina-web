<script lang="ts" setup>
</script>

<template>
	<div class="relative py-8">
		<div class="flex flex-col lg:justify-between gap-4">
			<p
				v-if="$slots.headline"
				class="mb-2.5 text-sm font-semibold text-primary flex items-center gap-1.5"
			>
				<slot
					mdc-unwrap="p"
					name="headline"
				/>
			</p>
			<h2 class="text-2xl font-bold text-pretty text-highlighted sm:text-3xl">
				<slot
					mdc-unwrap="p"
					name="default"
				/>
			</h2>
			<p
				v-if="$slots.description"
				class="text-lg text-pretty text-muted"
			>
				<slot
					mdc-unwrap="p"
					name="description"
				/>
			</p>
		</div>
	</div>
</template>

<style scoped>

</style>
