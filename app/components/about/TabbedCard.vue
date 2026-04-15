<script lang="ts" setup>
interface Props {
	title: string;
	description: string | undefined;
	reverse?: boolean;
	image: string | undefined;
}

withDefaults(defineProps<Props>(), {
	reverse: false,
});

defineSlots<{
	custom?: (props: Record<string, never>) => unknown;
}>();
</script>

<template>
	<UCard
		:ui="{
			body: `min-h-72 bg-muted`,
		}"
	>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
			<div
				:class="[
					reverse ? 'md:order-2' : 'md:order-1',
					reverse ? 'md:text-end' : 'text-start',
				]"
				class="flex flex-col gap-4 md:col-span-2"
			>
				<div
					:class="[reverse ? 'md:text-end' : 'text-start', 'm-4', 'flex flex-col gap-4']"
				>
					<p class="text-2xl font-bold text-pretty text-highlighted">
						{{ title }}
					</p>
					<p>{{ description }}</p>
				</div>
				<div>
					<slot name="custom" />
				</div>
			</div>
			<div
				:class="[reverse ? 'md:order-1' : 'md:order-2']"
				class="md:col-span-1 w-full md:h-full aspect-square md:aspect-1/3"
			>
				<NuxtImg
					:alt="title"
					:src="image"
					class="w-full h-full object-cover rounded-lg"
					preset="thumbnailMd"
				/>
			</div>
		</div>
	</UCard>

<!--	<UCard -->
<!--		:ui="{ -->
<!--			body: 'min-h-96', -->
<!--		}" -->
<!--	> -->
<!--		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"> -->
<!--			&lt;!&ndash; Text Content (2/3 width on desktop) &ndash;&gt; -->
<!--			<div class="md:col-span-2 flex flex-col justify-start"> -->
<!--				<slot name="chemistry" /> -->
<!--			</div> -->

<!--			&lt;!&ndash; Image Content (1/3 width on desktop) &ndash;&gt; -->
<!--			<div class="md:col-span-1 flex items-center justify-center object-cover w-full md:h-full rounded-lg"> -->
<!--				<slot name="chemistry-image" /> -->
<!--			</div> -->
<!--		</div> -->
<!--	</UCard> -->
<!--	<UCard -->
<!--		:ui="{ -->
<!--			body: 'min-h-96', -->
<!--		}" -->
<!--	> -->
<!--		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"> -->
<!--			&lt;!&ndash; Image Content (1/3 width on desktop) &ndash;&gt; -->
<!--			<div class="md:col-span-1 flex items-center justify-center order-2 md:order-1 object-cover w-full md:h-full rounded-lg"> -->
<!--				<slot name="biology-image" /> -->
<!--			</div> -->

<!--			&lt;!&ndash; Text Content (2/3 width on desktop) &ndash;&gt; -->
<!--			<div class="md:col-span-2 flex flex-col justify-start order-1 md:order-2"> -->
<!--				<slot name="biology" /> -->
<!--			</div> -->
<!--		</div> -->
<!--	</UCard> -->
</template>
