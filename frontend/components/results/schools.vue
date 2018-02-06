<template>
	<div class="p-sm-3" ref="schools">
		<b-row class="d-print-none mb-4">
			<b-col cols="12" sm="auto">
				<b-row align-v="center">
					<!-- Division -->
					<b-col cols="12">
						<label><strong>Division</strong></label>
					</b-col>
					<b-col>
						<b-select v-model="division">
							<option :value="null">Please select the school division</option>
							<optgroup v-for="optionGroup in Object.keys(divisions)" :key="optionGroup" :label="divisions[optionGroup].label">
								<option v-for="option in divisions[optionGroup].values" :disabled="!(option in t.divisions)" :value="option" :key="option">{{option}}</option>
							</optgroup>
						</b-select>
					</b-col>
				</b-row>
			</b-col>
			<b-col cols="12" sm="" class="mt-3 mt-sm-0">
				<b-row>
					<!-- School -->
					<b-col cols="12">
						<label><strong>School</strong></label>
					</b-col>
					<b-col>
						<b-select v-model="school" :options="schools"/>
					</b-col>
				</b-row>
			</b-col>
		</b-row>
		<!-- Main display -->
		<div v-if="school" class="mt-3">
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
			<div class="page-no-break-inside">
				<h5 class="mt-5">Top4 score </h5>
				<div variant="light" class="panel p-0 d-flex justify-content-center align-items-center">
					<span class="banner">{{t.divisions[division].schools[school].stats.top4}}</span>
				</div>
			</div>
			<div class="page-no-break-inside">
				<h5 class="mt-3">Ciphering total</h5>
				<div variant="light" class="panel d-flex justify-content-center align-items-center"></div>
			</div>
			<div class="page-no-break-inside">
				<h5 class="mt-3">Match total</h5>
				<div variant="light" class="panel d-flex justify-content-center align-items-center"></div>
			</div>
		</div>
		<b-alert v-else show variant="warning">
			No records found
		</b-alert>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import * as params from "../../../configs/params";
import types from "../../store/mutations";
import { debounce } from "lodash";
export default {
	data: () => ({
		division: null,
		school: null
	}),
	watch: {
	},
	computed: {
		...mapGetters({
			t: "getTournament"
		}),
		divisions() {
			return params.D;
		},
		schools() {
			let result = [
				{ value: null, text: "--" }
			];
			if(this.division && this.t.divisions[this.division]) {
				result = Object.keys(this.t.divisions[this.division].schools).map(e => ({
					value: e,
					text: e
				}));
			}
			if(result.map(e => e.value).indexOf(this.school) === -1) {
				this.school = result[0].value;
			}
			return result;
		},
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
		}
	},
	mounted() {
		// console.log(this.t);
		// console.log('--------',this.$refs);
	},
};
</script>

<style >
h4,
h5 {
	text-shadow: 1px 1px 2px #ccc;
}
.th > span {
	font-size: small;
	vertical-align: super;
}
.correct {
	font-weight: bold;
}
.nowrap {
	white-space: nowrap;
}
.banner {
	font-size: xx-large;
	font-weight: bold;
}
.panel {
	height: 5em;
	border: 1px solid black;
	border-radius: 10px;
}
</style>
