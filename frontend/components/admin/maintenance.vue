<template>
	<div class="mt-3 p-3">
		<b-alert show dismissible variant="danger">
			This interface is intended for direct manipulation of selected database fileds. Use with caution. 
		</b-alert>
		<!-- Resequence registrations -->
		<h4>Re-sequence registrations</h4>
		<p>
			All registration records are assigned with unique numbers that constitute part of the registration ID. Any given registration is associated with a 2-digits number. Re-sequencing process sorts all registrations by e-mail and assigns sequence numbers starting from "00".					
		</p>
		<b-btn variant="outline-danger" @click="reSequence">Re-sequence</b-btn>
		<hr>
		<!-- Remove stale data -->
		<h4>Remove stale database entries</h4>
		<p>
			Stale (partially empty, unused) database records are created as a result of improper user actions and have to be eliminated. Both "accounts" and "registrations" collections are subjects of such processing. The following types of records will be removed:
			<ul>
				<li>Records from "accounts" without matching "registrations"</li>
				<li>Records from "registrations" with both <strong>main</strong> and <strong>temp</strong> attributes set to <strong>null</strong></li>	
			</ul>
		</p>
		<b-btn variant="outline-danger" @click="removeStaleData">Remove stale data</b-btn>
	</div>
</template>

<script>
// import axios from 'axios';
export default {
	props: {
		credentials: Object
	},
	data: () => ({
		runtime: {
			credentials: {}
		}
	}),
	created() {
		this.runtime.credentials = this.credentials;
	},
	watch: {
		credentials() {
			this.runtime.credentials = this.credentials;
		}
	},
	methods: {
		removeStaleData() {
			this.axios
			.post("/api/mtn/removeStale", {
				credentials: this.runtime.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`Stale records have been removed`);
					console.log(JSON.stringify(response.data.stat,null,3));
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		reSequence() {
			this.axios
			.post("/api/mtn/reseq", {
				credentials: this.runtime.credentials
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
