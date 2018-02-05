<template>
	<div class="p-sm-3">
		<b-row align-v="center">
			<b-col cols="12" sm="auto">
				<label>School division</label>
			</b-col>
			<b-col col sm>
				<b-select v-model="division">
					<option :value="null">Please select the school division</option>
					<optgroup :label="options.GISA.label">	
						<option v-for="option in options.GISA.values" :value="option" :key="option">{{option}}</option>
					</optgroup>
					<optgroup :label="options.GHSA.label">	
						<option v-for="option in options.GHSA.values" :value="option" :key="option">{{option}}</option>
					</optgroup>
				</b-select>
			</b-col>
		</b-row>
		<!-- Schools ranking -->
		<h5 class="mt-5">
			School ranking
		</h5>
		<b-table 
			class="mt-3"
			:fields="schools.fields" 
			:items="schools.items" 
			v-model="schoolsList"
			responsive="sm"
			head-variant="dark"
			striped
			hover
			v-show="showSchools">
		</b-table>
		<b-alert v-show="!showSchools" show variant="warning">
			No records found
		</b-alert>
		<!-- Students ranking -->
		<h5 class="mt-5">
			Students ranking <small v-show="showStudents">(avg:{{stats.avg}}, std:{{stats.std}})</small>
		</h5>
		<b-table 
			class="mt-3"
			:fields="students.fields" 
			:items="students.items" 
			v-model="studentsList"
			responsive="sm"
			head-variant="dark"
			striped
			hover
			v-show="showStudents">
		</b-table>
		<b-alert v-show="!showStudents" show variant="warning">
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
		schoolsList: null,
		studentsList:null
	}),
	watch: {
	},
	computed: {
		...mapGetters({
			t: "getTournament"
		}),
		options() {
			return params.D;
		},
		showSchools() {
			return this.schoolsList && this.schoolsList.length;
		},
		showStudents() {
			return this.studentsList && this.studentsList.length;
		},
		stats() {
			let result = {
				std: 'N/A',
				avg: 'N/A'
			}
			if(this.division && this.division in this.t.divisions) {
				let list = this.t.divisions[this.division].stats.rank.students.map(i => i.score);
				let avg = list.reduce((a,i) => a + i, 0) / list.length
				let std = Math.sqrt(list.reduce((a,i) => a + Math.pow(i - avg, 2), 0) / list.length);
				result = {
					avg: avg.toFixed(2),
					std: std.toFixed(2)
				}
			}
			return result;
		},
		schools() {
			let items = [];
			if(this.division && this.division in this.t.divisions) {
				items = this.t.divisions[this.division].stats.rank.schools.map((e,i) => ({
					rank: i+1,
					school: e.school,
					top4: e.score
				}))
			};
			let fields = [
				{
					key: 'rank',
					label: 'Rank',
				},
				{
					key: 'school',
					label: 'School name',
					tdClass: 'nowrap',
				},
				{
					key: 'top4',
					label: 'Top4 score',
				}
			];
			return {items,fields};	
		},
		students() {
			let items = [];
			if(this.division && this.division in this.t.divisions) {
				items = this.t.divisions[this.division].stats.rank.students.map((e,i) => ({
					rank: i+1,
					name: e.name,
					school: e.school,
					score: e.score
				}))
			};
			let fields = [
				{
					key: 'rank',
					label: 'Rank',
				},
				{
					key: 'name',
					label: 'Name',
					tdClass: 'nowrap',
				},
				{
					key: 'school',
					label: 'School',
					tdClass: 'nowrap',
				},
				{
					key: 'score',
					label: 'Score'
				}
			];
			return {items,fields};	
		},
	},
	mounted() {
		console.log(this.t);
	},
	methods: {
	}
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
</style>
