<template>
	<div>
		<h4>Archive tournament data (registrations, questions, scans)</h4>
		<p class="mt-3 text-justify">
			The application can be rolled out for the next year by archiving current year data so the tournament results remain available.The archived version of the tournament doesn't contain <i>temporal (unconfirmed) registrations</i>, <i>payment status</i>, etc. After archiving you will <strong>need to explicitely wipe current tournament data</strong> by using dedicated maintenance utility.
		</p>
		<b-row align-v="center" class="my-2">
			<b-col cols="12" sm="auto">
				<label><strong>Archive label (year)</strong></label>
			</b-col>
			<b-col cols="auto" class="pl-sm-0">
				<b-form-input 
					type="text" 
					v-model="year"  
					placeholder="year in 4-digits format"
					aria-describedby="inputLiveFeedback" 
					:state="disabled ? false : null"/>
				<b-form-invalid-feedback id="inputLiveFeedback">
      			Year has to be specified in 4-digits format
    			</b-form-invalid-feedback>
			</b-col>
			<b-col cols="auto" class="d-block ml-auto">
				<b-btn :disabled="disabled" variant="outline-danger" @click="doArchive">Archive</b-btn>
			</b-col>
		</b-row>
		
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
	data: () => ({
		year: new Date().getFullYear().toString()
	}),
	computed: {
		...mapGetters({
			credentials: 'getCredentials',
		}),
		disabled() {
			return !/^\d{4}$/.test(this.year);
		}
	},
	created() {
	},
	methods: {
		doArchive() {
			this.axios
			.post("/api/mtn/archive", {
				credentials: this.credentials,
				year: this.year
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`Tournament data have been successfully archived`);
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
	}
};
</script>

