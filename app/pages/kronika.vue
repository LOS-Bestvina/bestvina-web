<script lang="ts" setup>
import { CURRENT_YEAR } from "#shared/constants";

definePageMeta({
	layout: "page",
});

// get all years but the current one
const { data: years } = await useAsyncData("years-list", () => {
	return queryCollection("years")
		.where("year", "<>", CURRENT_YEAR)
		.order("year", "DESC")
		.all();
});
</script>

<template>
	<UPage>
		<UPageHeader
			title="Kronika"
		/>

		<UPageBody>
			<UBlogPosts>
				<UBlogPost
					v-for="(yearObj, index) in years"
					:key="index"
					:description="yearObj.theme"
					:image="{
						src: `${yearObj.coverImg}`,
						loading: 'lazy',
						decoding: 'async',
						preset: 'thumbnailLg',
					}"
					:title="`Ročník ${yearObj.year}`"
					:to="`/rocniky/${yearObj.year}`"
					variant="subtle"
				/>
			</UBlogPosts>
		</UPageBody>
	</UPage>
</template>
