<script lang="ts" setup>
import ClickableLogo from "~/components/landing/ClickableLogo.vue";

const organizers = ref([{
	link: "https://vscht.cz/",
	src: "/imgs/logos/vscht.png",
	srcDark: "/imgs/logos/dark/vscht.png",
	alt: "VŠCHT Praha",
},
{
	link: "https://natur.cuni.cz/",
	src: "/imgs/logos/prf_uk.png",
	srcDark: "/imgs/logos/dark/prf_uk.png",
	alt: "PřF UK",
}]);

const sponsors = ref([{
	link: "https://www.orlenunipetrol.cz/",
	src: "/imgs/logos/orlen_unipetrol.png",
	srcDark: "/imgs/logos/dark/orlen_unipetrol.png",
	alt: "ORLEN Unipetrol",
}, {
	link: "https://www.lach-ner.cz/",
	src: "/imgs/logos/lachner.png",
	srcDark: "/imgs/logos/dark/lachner.png",
	alt: "ORLEN Unipetrol",
	extraClass: "p-4",
}]);
</script>

<template>
	<div>
		<div class="max-w-(--ui-container) flex flex-col lg:grid py-16 lg:py-24 gap-8 sm:gap-16 lg:items-center w-full  mx-auto px-4 sm:px-6 lg:px-8">
			<div>
				<p class="text-lg text-center font-semibold text-highlighted mx-8 mb-4">
					Organizátoři
				</p>
				<div class="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-4">
					<ClickableLogo
						v-for="org in organizers"
						:key="org.link"
						:alt="org.alt"
						:link="org.link"
						:src="org.src"
						:src-dark="org.srcDark"
					/>
				</div>
			</div>
			<div>
				<p class="text-lg text-center font-semibold text-highlighted mx-8 mb-4">
					Sponzoři
				</p>
				<div class="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-4">
					<ClickableLogo
						v-for="org in sponsors"
						:key="org.link"
						:alt="org.alt"
						:extra-class="org.extraClass"
						:link="org.link"
						:src="org.src"
						:src-dark="org.srcDark"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>
