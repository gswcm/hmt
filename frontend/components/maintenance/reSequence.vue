<template>
	<div>
		<h4>Re-sequence registrations</h4>
		<p class="mt-3 text-justify">
			All registration records are assigned with unique numbers that constitute part of the registration ID. Any given registration is associated with a 2-digits number. Re-sequencing process sorts all registrations by e-mail and assigns sequence numbers starting from "00".					
		</p>
		<b-btn class="ml-auto d-block" variant="outline-danger" @click="reSequence">Re-sequence</b-btn>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
	data: () => ({
	}),
	computed: {
		...mapGetters({
			credentials: 'getCredentials',
		}),
	},
	created() {
	},
	methods: {
		reSequence() {
			this.axios
			.post("/api/mtn/reseq", {
				credentials: this.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`Registrations have been re-sequenced`);
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

