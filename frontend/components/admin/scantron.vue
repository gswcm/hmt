<template>
	<div class="p-4">
		<b-row>
			<b-col cols="12" class="" >
				<b-textarea ref="textarea" :value="evalString" @input="evalUpdated" :rows="15" :max-rows="15" wrap="off" class="bg-light" :no-resize="true" placeholder="Scantron data will show up here..."/>
			</b-col>
		</b-row>
		<div class="mt-3 d-flex justify-content-end">
			<b-btn 
				variant="outline-dark" 
				@click="evalLoad"
				class="mr-auto">
				<font-awesome-icon :icon="['fas', 'database']"/>
				<span class="d-none d-sm-inline-block">Load</span>
				<span class="d-inline-block d-sm-none">L.</span>
			</b-btn>
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
				<span class="d-none d-sm-inline-block">Clear</span>
				<span class="d-inline-block d-sm-none">C.</span>
			</b-btn>
			<b-btn variant="outline-dark" class="ml-3" v-b-modal.confirmClearRemote v-b-tooltip.hover title="Clear scan data stored in the database">
				<font-awesome-icon :icon="['fas', 'database']"/>
				<span class="d-none d-sm-inline-block">Erase</span>
				<span class="d-inline-block d-sm-none">E.</span>
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
import { debounce } from 'lodash';
export default {
	props: {
		credentials: Object
	},
	data: () => ({
		runtime: {
			credentials: {}
		},
		evalData: [],
		force: false,
		timer: null
	}),
	created() {
		this.runtime.credentials = this.credentials;
	},
	computed: {
		evalString() {
			return this.timer ? this.evalStringBackup : this.a2s(this.evalData, true);
		},
		evalDataFiltered() {
			//-- Remove exact duplicates
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
			return a.map(i => {
				let result = "";
				if(i.length > 4) {
					result += `${i.substr(0,4)} `;
					if(i.length > 44) {
						result += `${i.substr(4,40)} ${i.substr(44)}`;
					}
					else {
						result += `${i.substr(4)}`;
					}
				}
				else {
					result = i;
				}
				return result;
			}).join('\n');
		},  
		evalUpdated(value) {
			//-- Backup current "string" value of the textarea
			this.evalStringBackup = value;
			//-- Timer for editing time window control
			if(this.timer) {
				clearTimeout(this.timer);
			}
			this.timer = setTimeout( () => {
				this.timer = null;
			}, 1000)
			//-- update the array of lines
			this.evalData = this.s2a(value, true);
		},
		evalLoad() {
			this.axios
			.post("/api/scan/get", {
				credentials: this.runtime.credentials,
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.evalData = this.evalData.concat(response.data.scans);
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		evalProcess(force = false) {
			this.axios
			.post("/api/scan/set", {
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
					this.evalData = response.data.result.redo;
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
			.post("/api/scan/set", {
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
		font-weight: 500;
	}
</style>
