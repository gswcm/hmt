<template>
	<div class="mt-3 p-3">
		<b-alert show variant="danger">
			This interface is intended for direct manipulation of selected database tables. Use with caution. 
		</b-alert>
		<!-- Resequence registrations -->
		<h4>Re-sequence registrations</h4>
		<p>
			All registration records are assigned with unique numbers that constitute part of the registration ID. Any given registration is associated with a 2-digits number. Re-sequencing process sorts all registrations by e-mail and assigns sequence numbers starting from "00".					
		</p>
		<b-btn class="ml-auto d-block" variant="outline-danger" @click="reSequence">Re-sequence</b-btn>
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
		<b-btn class="ml-auto d-block" variant="outline-danger" @click="removeStaleData">Remove stale data</b-btn>
		<hr>
		<!-- Archive tournament data -->
		<h4>Archive tournament data (registrations, questions, scans)</h4>
		<p>
			The application can be rolled out for the next year tournament by archiving current year data so the results remain available.The archived version of tournament data doeasn't maintain service info like <i>temporal (unconfirmed) registrations</i>, <i>payment status</i>, etc. After archiving you will need to explicitely wipe current tournament data by using dedicated maintenance utility.
		</p>
		<b-btn class="ml-auto d-block" variant="outline-danger" @click="doArchive">Archive all data</b-btn>
		<hr>
		<!-- Set tournament dates -->
		<h4>Set important deadlines for the current year tournament</h4>
		<p>
			The tournament event is associated with <strong>4 dealines</strong>:
			<ol>
				<li><strong>Payments</strong> without late fee</li>
				<li>Allowance to make <strong>new</strong> registrations</li>
				<li>Allowance to <strong>update</strong> existing registrations</li>
				<li><strong>Release</strong> of tournament results</li>
			</ol>
		</p>
		<b-alert class="p-3" show variant="warning">
			Make sure that all <strong>deadlines are ordered</strong>, e.g. "payment" must happen before "new registration cut-off". Otherwise <strong>update button</strong> will be disabled.
		</b-alert>
		<b-row align-v="end">
			<b-col cols="12" sm="3" class="mt-3 mt-sm-0"> 
				<strong class="ml-2">Payment</strong>
				<datepicker 
					:disabled="datepickingDisabled"
					:class="['border', 'rounded', 'mt-1', 'p-2', 'datepicker', deadlines.payment ? 'border-dark' : 'border-danger']" 
					placeholder="Select date" 
					v-model="deadlines.payment"/>
			</b-col>
			<b-col cols="12" sm="3" class="mt-3 mt-sm-0"> 
				<strong class="ml-2">New registrations</strong>
				<datepicker 
					:disabled="datepickingDisabled"
					:class="['border', 'rounded', 'mt-1', 'p-2', 'datepicker', deadlines.makeNew ? 'border-dark' : 'border-danger']" 
					placeholder="Select date" 
					v-model="deadlines.makeNew"/>
			</b-col>
			<b-col cols="12" sm="3" class="mt-3 mt-sm-0"> 
				<strong class="ml-2">Update registrations</strong>
				<datepicker 
					:disabled="datepickingDisabled"
					:class="['border', 'rounded', 'mt-1', 'p-2', 'datepicker', deadlines.updateExisting ? 'border-dark' : 'border-danger']" 
					placeholder="Select date" 
					v-model="deadlines.updateExisting"/>
			</b-col>
			<b-col cols="12" sm="3" class="mt-3 mt-sm-0"> 
				<strong class="ml-2">Release results</strong>
				<datepicker 
					:disabled="datepickingDisabled"
					:class="['border', 'rounded', 'mt-1', 'p-2', 'datepicker', deadlines.releaseResults ? 'border-dark' : 'border-danger']" 
					placeholder="Select date" 
					v-model="deadlines.releaseResults"/>
			</b-col>
		</b-row>
		<b-btn :disabled="!disableDeadlineUpdate" class="ml-auto d-block mt-5" variant="outline-danger" @click="doDeadlines(true)">Update deadlines</b-btn>
		<!-- Spacer -->
		<div class="py-5 mt-5"></div>
	</div>
</template>

<script>
import Datepicker from 'vuejs-datepicker'
export default {
	props: {
		credentials: Object
	},
	components: {
		Datepicker
	},
	data: () => ({
		runtime: {
			credentials: {}
		},
		deadlines: {
			makeNew: null,
			updateExisting: null,
			payment: null,
			releaseResults: null
		},
		datepickingDisabled: {
			//-- Dates can be set up to 5 days before today's date
			to: (() => {
				let d = new Date();
				d.setDate(d.getDate()-5);
				return d;
			})()
		}
	}),
	computed: {
		disableDeadlineUpdate() {
			const order = ['payment', 'makeNew', 'updateExisting', 'releaseResults'];
			let result = (this.deadlines[order[0]] !== null) && 
				order.slice(1).reduce((a,e,i) => a && (this.deadlines[e] !== null) && (new Date(this.deadlines[order[i+1]]) >= new Date(this.deadlines[order[i]])), true);
			return result;
		}
	},
	created() {
		this.runtime.credentials = this.credentials;
		this.doDeadlines();
	},
	watch: {
		credentials() {
			this.runtime.credentials = this.credentials;
		}
	},
	methods: {
		doDeadlines(update = false) {
			this.axios
			.post("/api/mtn/timeline", {
				credentials: this.runtime.credentials,
				deadlines: this.deadlines,
				update
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					if(response.data.timeline && response.data.timeline.deadlines) {
						this.deadlines = response.data.timeline.deadlines;
					}
					if(update) {
						this.$noty.success(`Deadlines have been updated`);
					}
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		doArchive() {
			this.axios
			.post("/api/mtn/archive", {
				credentials: this.runtime.credentials,
				year: new Date().getFullYear().toString()
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
<style>
	.datepicker input {
		border: none;
	}
</style>

