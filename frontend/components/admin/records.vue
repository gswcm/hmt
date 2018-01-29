<template>
	<b-row class="p-4">
		<b-col cols="12" md="auto">
			<h4 class="my-3">Filters</h4>
			<div class="bg-light px-3 py-1 mt-1 rounded">
				<!-- Payment status -->
				<b-form-group label="Payment status">
					<b-form-radio-group :checked="filter.paid" @input="filterUpdated('paid',$event)">
						<b-form-radio :value="true">Paid</b-form-radio>
						<b-form-radio :value="false">Not paid</b-form-radio>
						<b-form-radio :value="null">Any</b-form-radio>
					</b-form-radio-group>
				</b-form-group>
				<!-- Partial email match -->
				<b-form-group label="Sponsor's <span class='text-info'>e-mail</span> contains...">
					<b-form-input :value="filter.email" @input="debounce('email',$event)" type="text" placeholder="part of the sponsor's e-mail"></b-form-input>
				</b-form-group>
				<!-- Partial sponsor name match -->
				<b-form-group label="Sponsor's <span class='text-info'>name</span> contains...">
					<b-form-input :value="filter.name" @input="debounce('name',$event)" type="text" placeholder="part of the sponsor's name"></b-form-input>
				</b-form-group>
				<!-- Partial school name match -->
				<b-form-group label="<span class='text-info'>School</span> name contains...">
					<b-form-input :value="filter.school" @input="debounce('school',$event)" type="text" placeholder="part of the school name"></b-form-input>
				</b-form-group>
				<!-- Division -->
				<b-form-group label="School <span class='text-info'>division</span>">
					<b-select 
						:value="filter.division" 
						:state="null"
						@input="filterUpdated('division',$event)">
						<option :value="null">--</option>
						<optgroup label="GISA (private schools)">	
							<option value="GISA AA">GISA AA</option>
							<option value="GISA AAA">GISA AAA</option>
						</optgroup>
						<optgroup label="GHSA (public schools)">	
							<option value="GHSA A">GHSA A</option>
							<option value="GHSA AA">GHSA AA</option>
							<option value="GHSA AAA">GHSA AAA</option>
							<option value="GHSA AAAA">GHSA AAAA</option>
							<option value="GHSA AAAAA">GHSA AAAAA</option>
							<option value="GHSA AAAAAA">GHSA AAAAAA</option>
							<option value="GHSA AAAAAAA">GHSA AAAAAAA</option>
						</optgroup>
					</b-select>
				</b-form-group>
				<hr>
				<!-- Admin status -->
				<b-form-group label="Admin status">
					<b-form-radio-group :checked="filter.admin" @input="filterUpdated('admin',$event)">
						<b-form-radio :value="true">Admin</b-form-radio>
						<b-form-radio :value="false">Regular user</b-form-radio>
						<b-form-radio :value="null">Any</b-form-radio>
					</b-form-radio-group>
				</b-form-group>
				<hr>
				<!-- Registration confirmation status -->
				<b-form-group label="Confirmation status">
					<b-form-radio-group :checked="filter.confirmed" @input="filterUpdated('confirmed',$event)">
						<b-form-radio :value="true">Confirmed</b-form-radio>
						<b-form-radio :value="false">Pending</b-form-radio>
						<b-form-radio :value="null">Any</b-form-radio>
					</b-form-radio-group>
				</b-form-group>
			</div>
			<div class="mt-3">
				<!-- Refresh -->
				<b-btn variant="outline-dark" @click="refresh">
					<i class="fa fa-refresh" aria-hidden="true"></i>
					Refresh
				</b-btn>
				<!-- Download all -->
				<b-btn variant="outline-dark" class="ml-3" @click="printMany">
					<i class="fa fa-download" aria-hidden="true"></i>
					Download all
				</b-btn>
			</div>
		</b-col>
		<b-col cols="auto" class="d-none d-md-block px-0 border-left"></b-col>
		<b-col cols="12" md>
			<div v-if="options.length" class="mt-3">	
				<b-alert show variant="info">
					<!-- Select the school -->
					<b-row align-v="center">
						<b-col cols="3" sm="auto" md="3" lg="auto">
							<label><strong>School</strong></label>
						</b-col>
						<b-col cols="9" sm="" md="9" lg="" class="pl-0">
							<b-form-select v-model="email" :options="options"/>
						</b-col>
						<b-col cols="12" class="d-sm-none d-md-block d-lg-none py-1"></b-col>
						<b-col cols="auto" sm="auto" class="pl-0 order-3 order-md-3 order-sm-2 order-lg-2 ml-auto ml-sm-0 ml-md-auto ml-lg-0">
							<b-btn class="" variant="outline-dark" v-b-modal.confirmRegistration v-b-tooltip.hover title="Confirm registration">
								<i class="fa fa-check" aria-hidden="true"></i>
							</b-btn>
							<b-btn class="" variant="outline-dark" v-b-modal.removeRecord v-b-tooltip.hover title="Remove registration record">
								<i class="fa fa-trash" aria-hidden="true"></i>
							</b-btn>
							<b-btn class="" variant="outline-dark" v-clipboard:copy="email" v-clipboard:success="onCopy" v-b-tooltip.hover title="Copy email to clipboard">
								<i class="fa fa-clipboard" aria-hidden="true"></i>
							</b-btn>
							<b-btn class="" variant="outline-dark" v-b-tooltip.hover title="Download printable PDF" @click="printOne(reg)">
								<i class="fa fa-download" aria-hidden="true"></i>
							</b-btn>
						</b-col>
						<b-col cols="5" sm="12" md="4" lg="12" class="order-2 order-md-2 order-sm-3 order-lg-3">
							<!-- Change payment status -->
							<b-form-checkbox class="mt-3 ml-auto" :checked="paid" @change="paidUpdated">
								Payment <span class="d-none d-sm-inline-block d-md-none d-lg-inline-block">status</span>
							</b-form-checkbox>
						</b-col>	
					</b-row>
					<!-- Confirm removal -->
					<b-modal id="removeRecord" title="Are you sure?" ok-title="Confirm" cancel-title="Close" @ok="removeRecord">
						<p>
							You are about to permanently remove registration record for <strong>{{email}}</strong>. Please confirm your will or close this dialog to cancel.
						</p>
					</b-modal>
					<!-- Confirm converting Temp -> Main -->
					<b-modal id="confirmRegistration" title="Are you sure?" ok-title="Confirm" cancel-title="Close" @ok="confirmRegistration">
						<p>
							You are about confirm temporal registration for <strong>{{email}}</strong>. Please confirm your will or close this dialog to cancel.
						</p>
					</b-modal>
				</b-alert>
				<registration v-if="reg_filtered !== null" :value="reg_filtered" :options="{ debug: false, ro: true }"/>					
			</div>
			<b-alert v-else show variant="warning">
				<h5>No records found</h5>
			</b-alert>
		</b-col>
	</b-row>
</template>

<script>
import { debounce, escapeRegExp, pick } from "lodash";
import registration from "../form/registration.vue";
import jsPDF from "jspdf";
import { sprintf } from "sprintf-js";
export default {
	components: {
		registration,
	},
	props: {
		credentials: Object
	},
	watch: {
		credentials() {
			this.runtime.credentials = this.credentials;
		}
	},
	data: () => ({
		runtime: {
			credentials: {}
		},
		records: [],
		filter: {
			paid: null,
			admin: false,
			confirmed: true,
			email: "",
			name: "",
			school: "",
			division: null
		},
		email: "",
	}),
	created() {
		this.runtime.credentials = this.credentials;
		this.refresh();
	},
	computed: {	
		paid() {
			let record = this.records.find(i => i.email === this.email);
			return record ? record.paid : false;
		},
		reg() {
			return this.records.find(i => i.email === this.email);
		},
		reg_filtered() {
			return this.filter.confirmed && this.reg.main
				? this.reg.main
				: this.reg.temp ? this.reg.temp : null;
		},
		options() {
			return this.records.map(i => {
				let rec = this.filter.confirmed && i.main ? i.main : i.temp;
				return {
					value: i.email,
					text: `${rec.school.name} (${rec.team.names.length})`
				};
			});
		}
	},
	methods: {		
		printMany() {
			this.records
				.reduce((a, i) => this.printOne(i, false, a), null)
				.save("bulk.pdf");
		},
		printOne(reg, output = true, doc = null) {
			if (doc) {
				doc.addPage();
			} else {
				doc = new jsPDF({
					orientation: "p",
					unit: "mm",
					format: [279.4, 152.4]
				});
				doc.setFontSize(12);
			}
			//-- Test pattern, not to be printed in production
			/*
			for(let x=0; x<10; x++) {
				for(let y=0; y<10; y++) {
					// HP_M401dw
					doc.rect(58.5 + x * 4.2 + 0.6, 10.2 + y * 4.2 + 1.4, 2.9, 1.4, 'F');		
				}
			}
			doc.text('Simon Baev | Georgia Southwestern State University', 72, 200, {}, 90);
			doc.save('test.pdf');
			*/
			let studentIndex = 0;
			let seq = reg.seq;
			let rec = this.filter.confirmed && reg.main ? reg.main : reg.temp;
			let schoolName = rec.school.name;
			for (let s of rec.team.names) {
				let id = sprintf("%s%02d", seq, studentIndex++);
				doc.text(`${s} | ${schoolName}`, 72, 200, {}, 90);
				let colIndex = 0;
				for (let c of id.split("")) {
					let i = parseInt(c);
					doc.rect(
						58.5 + colIndex++ * 4.2 + 0.6,
						10.2 + i * 4.2 + 1.4,
						2.9,
						1.4,
						"F"
					);
				}
				if (studentIndex < rec.team.names.length) {
					doc.addPage();
				}
			}
			if (output) {
				doc.save(
					`${rec.school.division.replace(
						/\s+/g,
						"_"
					)}_${seq}_${rec.school.name.replace(/\s+/g, "")}.pdf`
				);
			} else {
				return doc;
			}
		},
		onCopy() {
			this.$noty.success(`E-mail copied into clipboard`);
		},
		confirmRegistration() {
			this.axios
				.post("/api/admin/confirm", {
					email: this.email,
					credentials: this.runtime.credentials
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} else {
						this.$noty.success(
							`Registration for ${
								response.data.email
							} has been confirmed`
						);
						this.refresh();
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
		},
		removeRecord() {
			this.axios
				.post("/api/admin/remove", {
					email: this.email,
					credentials: this.runtime.credentials
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} else {
						this.$noty.success(
							`Registration record for ${
								response.data.email
							} has been removed`
						);
						this.refresh();
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
		},
		paidUpdated(value) {
			this.axios
				.post("/api/admin/paid", {
					email: this.email,
					credentials: this.runtime.credentials,
					paid: value
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} else {
						this.$noty.success(
							`Payment status has been updated to '${
								response.data.paid ? "paid" : "not paid"
							}'`
						);
						this.refresh();
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
		},
		debounce: debounce(function(source, value) {
			this.filterUpdated(source, value);
		}, 500),
		filterUpdated(source, value) {
			this.filter[source] = value;
			this.refresh();
		},
		refresh() {
			let filter = {
				account: {
					admin: {
						$in:
							this.filter.admin === null
								? [true, false]
								: [this.filter.admin]
					}
				},
				registration: {}
			};
			if (this.filter.paid !== null) {
				filter.registration["paid"] = this.filter.paid;
			}
			if (this.filter.email.length) {
				filter.registration["email"] = {
					$regex: escapeRegExp(this.filter.email)
				};
			}
			if (this.filter.name.length) {
				filter.registration["temp.sponsor.name"] = {
					$regex: escapeRegExp(this.filter.name),
					$options: "i"
				};
			}
			if (this.filter.school.length) {
				filter.registration["temp.school.name"] = {
					$regex: escapeRegExp(this.filter.school),
					$options: "i"
				};
			}
			if (this.filter.division !== null) {
				filter.registration["temp.school.division"] = this.filter.division;
			}
			if (this.filter.confirmed !== null) {
				filter.registration["main"] = this.filter.confirmed
					? { $ne: null }
					: { $eq: null };
			}
			this.axios
				.post("/api/admin/records", { filter })
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} else {
						this.records = response.data.records;
						if (this.records.length) {
							if (!this.records.find(i => i.email === this.email)) {
								this.email = this.records[0].email;
							}
						} else {
							this.email = null;
						}
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

<style lang="scss">
	.border-left {
		border-left: 2px solid #aaa;
	}
	hr {
		border: 1px solid black;
	}
	.nav-tabs:focus {
		outline: none;
	}
</style>
