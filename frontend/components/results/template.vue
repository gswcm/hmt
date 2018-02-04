<template>
	<div class="p-4">
		
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as params from "../../../configs/params"
import types from '../../store/mutations';
export default {
	props: {
	},
	data: () => ({
		log: [],
	}),
	created() {
		this.refresh();
	},
	watch: {
	},
	computed: {
		...mapGetters({
			tournament: 'getTournament'
		}),
	},
	methods: {
	}
};
</script>

<style lang="scss" scoped>
	h4 {
		text-shadow: 1px 1px 2px #ccc;
	}
</style>
