<template>
	<div>
		<div class="d-none d-print-block">
			<div class="d-flex justify-content-center p-5 d-print-flex">
				<h3>{{school}} ({{division}})</h3>
			</div>
		</div>
		<p class="text-justify">
			The <strong>score</strong> is computed using the formula <strong>4C - I + 40</strong>, where <strong>C</strong> represents the number of correct responses and <strong>I</strong> represents the number of incorrect responses. Multiple marks are scored as incorrect responses. Blank responses do not affect the score. 
		</p>
		<h5 class="mt-5">School's statistics per question category, %</h5>
		<b-table 
			class="mt-3"
			:fields="tableSchool.fields" 
			:items="tableSchool.items" 
			responsive="sm"
			head-variant="dark"
			striped
			hover>
		</b-table>
		<h5 class="mt-5">Students' statistics per question category (# of correct answers / # of questions)</h5>
		<b-table 
			class="mt-3 page-no-break-inside"
			:fields="tableStudents.fields" 
			:items="tableStudents.items" 
			responsive="sm"
			head-variant="dark"
			striped
			hover>
		</b-table>
		<b-row class="page-no-break-inside mt-5" align-v="end">
			<b-col cols="" sm="" class="page-no-break-inside mt-3 mt-sm-0">
				<h5 class="ml-3">Top4 score </h5>
				<div variant="light" class="panel p-0 d-flex justify-content-center align-items-center">
					<span class="banner">{{t.divisions[division].schools[school].stats.top4}}</span>
				</div>
			</b-col>
			<b-col cols="" sm="4" class="page-no-break-inside mt-3 mt-sm-0">
				<h5 class="ml-3">Ciphering total</h5>
				<div variant="light" class="panel d-flex justify-content-center align-items-center">
					<masked-input 
						v-if="isAdmin" 
						:value="(ciphering > 0) ? ciphering.toString() : ''" 
						@input="cipheringUpdate"
						placeholder-char=" "
						mask="111" 
						class="banner-input form-control"/>	
					<span v-else-if="ciphering > 0" class="banner">{{ciphering}}</span>
				</div>	
			</b-col>
			<b-col cols="12" sm="" class="page-no-break-inside mt-3 mt-sm-0">
				<h5 class="ml-3">Match total</h5>
				<div variant="light" class="panel d-flex justify-content-center align-items-center">
					<span v-if="ciphering > 0" class="banner">{{total}}</span>
				</div>
			</b-col>
		</b-row>
	</div> 
</template>

<script>
	import * as params from "../../../configs/params";
	import { mapGetters } from 'vuex';
	import maskedInput from 'vue-masked-input';
	import { debounce } from 'lodash';
	export default {
		components: {
			maskedInput
		},
		props: {
			t: Object,
			school: String,
			division: String
		},
		data: () => ({
			ciphering: 0
		}),
		watch: {
			t() { 
				this.cipheringRefresh();
			},
			school() {
				this.cipheringRefresh();
			}
		},
		created() {
			this.cipheringRefresh();
		},
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
			}),
			tableSchool() {
				// Items
				let items = [];
				// Fields
				let fields = [
					{
						key: 'type',
						label: '&nbsp;'
					}
				];
				let itemsProps = {
					school: {
						type: 'School'
					},
					division: {
						type: 'Division'
					},
					tournament: {
						type: 'Tournament'
					}
				}
				for(let cat of Object.keys(params.Q)) {
					fields.push({
						key: cat,
						label: cat	
					});
					if(this.school && this.division) {
						itemsProps.school[cat] = this.t.divisions[this.division].schools[this.school].stats.cats[cat].toFixed(2);
						itemsProps.division[cat] = this.t.divisions[this.division].stats.cats[cat].toFixed(2);
						itemsProps.tournament[cat] = this.t.stats.cats[cat].toFixed(2);
					}
				}
				if(this.school && this.division) {
					items = [itemsProps.school, itemsProps.division, itemsProps.tournament];
				}
				return {items, fields}
			},
			tableStudents() {
				// Fields
				let fields = [
					{
						key: 'name',
						label: 'Name',
						sortable: true,
						tdClass: 'nowrap'
					},
					{
						key: 'score',
						label: 'Score',
						sortable: true
					}
				];
				for(let cat of Object.keys(params.Q)) {
					fields.push({
						key: cat,
						label: cat	
					});
				}
				fields.push({
					key: 'total',
					label: 'Total'	
				})
				// Items
				let items = [];
				if(this.school && this.division) {
					let students = this.t.divisions[this.division].schools[this.school].students;
					items = Object.keys(students).map((e,i) => {
						let student = students[e];
						let result = {
							name: student.name,
							score: student.score,
						}
						for(let cat of Object.keys(params.Q)) {
							result[cat] = `${student.counters.correct[cat]}/${this.t.stats.questions.lengths[cat]}`;
						}
						result.total = `${student.counters.correct.total}/${Object.keys(this.t.stats.questions.lengths).reduce((a,i) => a + this.t.stats.questions.lengths[i],0)}`;
						return result;
					}).sort((a,b) => b.score - a.score);
				}
				return {fields, items};
			},
			total() {
				return this.t.divisions[this.division].schools[this.school].stats.top4 + this.ciphering;	
			}
		},
		methods: {
			cipheringRefresh() {
				if(this.division && this.school) {
					this.ciphering = this.t.divisions[this.division].schools[this.school].stats.ciphering;
				}
			},
			cipheringUpdate: debounce(function(value = '') {
				value = parseInt(value.replace(/\D/g,'') || '0');
				this.axios
				.post("/api/results/ciphering", {
					division: this.division,
					school: this.school,
					value
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.ciphering = response.data.ciphering.value;
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			}, 500)
		}
	}
</script>

<style lang="scss">
	.panel {
		height: 5em;
		border: 1px solid black;
		border-radius: 10px;
	}
	.banner-input,
	.banner-input:focus {
		border: none;
		font-size: xx-large;
		font-weight: bold;
		text-align: center;
		padding: 0;
		margin: 0;
		color: #212529;
	}
</style>


