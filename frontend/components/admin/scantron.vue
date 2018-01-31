<template>
	<div class="p-4">
		<b-row>
			<b-col cols="12" sm="" class="">
				<b-textarea :value="scanString" @input="scanUpdated" :rows="15" :max-rows="15" wrap="off" class="bg-light" :no-resize="true" placeholder="Scantron"/>
			</b-col>
			<b-col cols="auto" class="d-none d-sm-flex flex-column justify-content-center">
				<b-btn variant="outline-dark" @click="scanToEval">
					<!-- <i class="fa fa-chevron-right" aria-hidden="true"></i> -->
					<font-awesome-icon :icon="['fas', 'angle-double-right']"/>
				</b-btn>
			</b-col>
			<b-col cols="12" class="d-block d-sm-none my-3">
				<b-btn class="mx-auto d-block" variant="outline-dark" @click="scanToEval">
					<!-- <i class="fa fa-chevron-down" aria-hidden="true"></i> -->
					<font-awesome-icon :icon="['fas', 'angle-double-down']"/>
				</b-btn>
			</b-col>
			<b-col cols="12" sm="" class="" >
				<b-textarea :value="evalString" @input="evalUpdated" :rows="15" :max-rows="15" wrap="off" class="bg-light" :no-resize="true" placeholder="Evaluation"/>
			</b-col>
		</b-row>
		<div class="mt-3 d-flex justify-content-end">
			<!-- 
			<b-form-checkbox v-model="force" class="d-block mr-auto">
				Force
			</b-form-checkbox> 
			-->
			<b-btn 
				:disabled="!evalDataFiltered.length" 
				variant="outline-dark" 
				@click="evalProcess(true)">
				<font-awesome-icon :icon="['fas', 'plus']"/>
				<span class="d-none d-sm-inline-block">Override</span>
				<span class="d-inline-block d-sm-none">O.</span>
			</b-btn>
			<b-btn 
				:disabled="!evalDataFiltered.length" 
				variant="outline-dark" 
				class="ml-3"
				@click="evalProcess(false)">
				<font-awesome-icon :icon="['fas', 'plus']"/>
				<span class="d-none d-sm-inline-block">Skip</span>
				<span class="d-inline-block d-sm-none">S.</span>
			</b-btn>
			<b-btn variant="outline-dark" class="ml-3" @click="evalData = []">
				<font-awesome-icon :icon="['fas', 'trash-alt']"/>
				<span class="d-none d-sm-inline-block">Local</span>
				<span class="d-inline-block d-sm-none">L.</span>
			</b-btn>
			<b-btn variant="outline-dark" class="ml-3" v-b-modal.confirmClearRemote v-b-tooltip.hover title="Clear scan data stored in the database">
				<font-awesome-icon :icon="['fas', 'trash']"/>
				<span class="d-none d-sm-inline-block">Remote</span>
				<span class="d-inline-block d-sm-none">R.</span>
			</b-btn>
			<b-modal id="confirmClearRemote" title="Are you sure?" ok-title="Confirm" cancel-title="Close" @ok="confirmClearRemote">
				<p>
					You are about to erase all scan records in the database. Please confirm your will or close this dialog to cancel.
				</p>
			</b-modal>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		credentials: Object
	},
	data: () => ({
		runtime: {
			credentials: {}
		},
		scanData: [
			"100500",
			"4108153400320001344405205504044014010314230000000",
			"2013152435351111314425121141232412155315314300000",
			"4043151423250031000404000251002000040000000000000",
			"1234JKGJG"
		],
		evalData: [],
		force: false
	}),
	created() {
		this.runtime.credentials = this.credentials;
	},
	computed: {
		scanString() {
			return this.a2s(this.scanData);
		},
		evalString() {
			return this.a2s(this.evalData, true);
		},
		evalDataFiltered() {
			let found = [];
			return this.evalData.filter(i => {
				if(found.indexOf(i) === -1) {
					found.push(i);
					return true;
				}
				else {
					return false;
				}
			})
		}
	},
	watch: {
		credentials() {
			this.runtime.credentials = this.credentials;
		}
	},
	methods: {
		s2a(s, strict = false) {
			s = s.replace(/[^0-9A-Z\n]/g,'');
			if(strict) {
				s = s.replace(/\n+/g,'\n')
			}
			let a = s.split(/\n/);
			if(a.length === 1 && !a[0].length) {
				a = [];
			}
			return a;
		},
		a2s(a) {
			return a.join('\n');
		},  
		scanUpdated(value) {
			this.scanData = this.s2a(value);
		},
		evalUpdated(value) {
			this.evalData = this.s2a(value, true);
		},
		scanToEval() {
			this.evalData = this.evalData.concat(this.scanData);
		},
		evalProcess(force = false) {
			this.axios
			.post("/api/scan", {
				credentials: this.runtime.credentials,
				evalData: this.evalDataFiltered,
				force
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					console.log(JSON.stringify(response.data.result, null, 3));
					this.evalData = Object.keys(response.data.result.duplicates).map(e => response.data.result.duplicates[e].new);
					if(this.evalData.length) {
						this.$noty.warning(`Some records have not been merged due to ID collision`);
					}
					else {
						this.$noty.success(`Evaluation data have been successfully merged into database`);
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
		confirmClearRemote() {
			this.axios
			.post("/api/scan", {
				credentials: this.runtime.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`All existing scan records have been removed from the database`);
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
	textarea {
		font-family: 'Roboto Mono', monospace;
		font-weight: 400;
	}
</style>
