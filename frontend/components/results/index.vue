<template>
	<div class="p-4">
		<b-btn variant="outline-dark" @click="refresh">Refresh</b-btn>
	</div>
</template>

<script>
import { pick } from "lodash";
export default {
	props: {
	},
	data: () => ({
		Q: [],
		R: [],
		S: []
	}),
	created() {
	},
	watch: {
	},
	methods: {
		refresh() {
			this.axios
			.post("/api/results/get")
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					let rqs = response.data.rqs;
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		}
	}
};
</script>

