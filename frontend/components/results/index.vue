<template>
	<div class="p-4">
		<div class="d-flex justify-content-center">
			<h4>Tournament results are categorized and displayed below</h4>
		</div>
		<b-tabs  pills card class="mt-3">
			<b-tab title="Tournament" active><tournament v-if="tournament"/></b-tab>
			<b-tab title="Divisions"></b-tab>
			<b-tab title="Schools"></b-tab>
			<b-tab title="Bulk"></b-tab>
			<b-tab v-if="isAdmin" title="Log" title-item-class="ml-auto"></b-tab>
		</b-tabs>
	</div>
</template>

<script>
import { pick } from "lodash";
import { sprintf } from "sprintf-js";
import { mapGetters } from 'vuex';
import * as params from "../../../configs/params"
import tournament from "./tournament.vue";
import types from '../../store/mutations';
export default {
	props: {
	},
	data: () => ({
		log: [],
	}),
	components: {
		tournament
	},
	created() {
		this.refresh();
	},
	watch: {
	},
	computed: {
		...mapGetters({
			isAdmin: 'getIsAdmin',
			tournament: 'getTournament'
		}),
	},
	methods: {
		refresh() {
			this.axios
			.post("/api/results/get")
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.log = [];
					let {R,Q,S} = {...response.data.rqs};
					let questions = {
						lengths: {},
						origin: Q
					};
					//-- inject statistics object into each question and calculate number of questions in each category
					for(let q of Q) {
						questions.lengths[q.cat] = (questions.lengths[q.cat] || 0) + 1
						q.counters = {
							0: 0,
							1: 0,
							2: 0,
							3: 0,
							4: 0,
							5: 0,
							correct: 0
						};
					}
					/* 
						Scantron records
					*/
					let tournament = null;
					let show = [];
					for(let i=0; i<S.length; i++) {				
						let id = S[i].substr(0,4);
						let answers = S[i].substr(4,40).split("").map(i => parseInt(i));
						let seq = id.substr(0,2);
						//-- Populate 'Student' object based on identified ID
						if(!(seq in R)) {
							this.log.push(`Scan parsing: incorrect ID in '${S[i]}' registration record '${seq}' is invalid`);
							continue;
						}
						show.push(id);
						let reg = R[seq];
						//-- Teams with more than 8 members (params.studentsPerTeam) must be split to introduce ALT teams
						let schoolName = reg.school.name
						let studentIndexInSchool = parseInt(id.substr(2,2))
						if(studentIndexInSchool >= params.studentsPerTeam) {
							schoolName = `${schoolName} ALT${Math.floor(studentIndexInSchool/params.studentsPerTeam)}`
						}
						let student = {
							id,
							division: reg.school.division,
							school: schoolName,
							name: reg.team.names[studentIndexInSchool],
							counters: {
								correct: {
									total: 0
								},
								incorrect: 0,
								blank: 0
							}	
						}
						for(let cat in params.Q) {
							student.counters.correct[cat] = 0;
						}
						//-- Evaluate answers
						for(let j=0; j<answers.length; j++) {
							Q[j].counters[answers[j]]++;
							if(answers[j] === 0) {
								student.counters.blank++;
								continue;
							}
							else if(answers[j] === Q[j].key) {
								//-- correct answer
								Q[j].counters.correct++;
								student.counters.correct.total++;
								student.counters.correct[Q[j].cat]++;
							}
							else {
								//-- incorrect answer
								student.counters.incorrect++;
							}
						}
						//-- Calculate student's score
						student.score = 4 * student.counters.correct.total - student.counters.incorrect + 40;
						//-- Store student's record in tournament result structure
						let divisions = (tournament = tournament || { divisions: {}, stats: {} }).divisions;
						let schools = (divisions[student.division] = divisions[student.division] || { schools: {}, stats: {} }).schools
						let students = (schools[student.school] = schools[student.school] || { students: {}, stats: {} }).students;
						students[student.id] = student;		
					};
					/* 					
						Statistics	
 					*/
					//-- Initialize tournament level stats
					tournament.stats = {
						scores: {
							values: [],
							std: 0,
							avg: 0
						},
						questions,
						cats: {},
						noshow: []
					}
					for(let cat in params.Q) {
						tournament.stats.cats[cat] = 0;
					}
					//-- Iterate throught the entire hierarchical structure to populate "stats" attributes
					for(let divisionKey in tournament.divisions) {
						let division = tournament.divisions[divisionKey];
						division.stats.rank = {
							schools: [],
							students: []
						};
						division.stats.cats = {};
						for(let cat in params.Q) {
							division.stats.cats[cat] = 0;
						}
						for(let schoolKey in division.schools) {
							let school = division.schools[schoolKey];
							school.stats.rank = [];
							school.stats.cats = {};
							for(let cat in params.Q) {
								school.stats.cats[cat] = 0;
							}
							for(let studentKey in school.students) {
								let student = school.students[studentKey];
								tournament.stats.scores.values.push(student.score);
								school.stats.rank.push({
									id: student.id,
									score: student.score
								});
								division.stats.rank.students.push({
									name: student.name,
									school: schoolKey,
									score: student.score
								})
								for(let cat in params.Q) {
									school.stats.cats[cat] += student.counters.correct[cat];
								}
							}
							school.stats.rank = school.stats.rank.sort((a,b) => b.score - a.score);
							school.stats.top4 = school.stats.rank.slice(0,4).reduce((a,i) => a + i.score, 0);
							division.stats.rank.schools.push({
								school: schoolKey,
								score: school.stats.top4
							})
							for(let cat in params.Q) {
								school.stats.cats[cat] /= school.stats.rank.length * tournament.stats.questions.lengths[cat] / 100;
								division.stats.cats[cat] += school.stats.cats[cat];
							}
						}
						division.stats.rank.schools = division.stats.rank.schools.sort((a,b) => b.score - a.score);
						division.stats.rank.students = division.stats.rank.students.sort((a,b) => b.score - a.score);
						for(let cat in params.Q) {
							division.stats.cats[cat] /= Object.keys(division.schools).length;
							tournament.stats.cats[cat] += division.stats.cats[cat];
						}						
					}
					for(let cat in params.Q) {
						tournament.stats.cats[cat] /= Object.keys(tournament.divisions).length;
					}
					//-- Tournament stats finalization
					let avg = tournament.stats.scores.values.reduce((a,i) => a + i, 0) / tournament.stats.scores.values.length;
					let std = Math.sqrt(tournament.stats.scores.values.reduce((a,i) => a + Math.pow(i - avg, 2), 0) / tournament.stats.scores.values.length);
					tournament.stats.scores.avg = avg;
					tournament.stats.scores.std = std;
					//-- No-show
					for(let r in R) {
						for(let i=0; i<R[r].team.names.length; i++) {
							let id = sprintf("%s%02d",r,i);
							if(show.indexOf(id) === -1) {
								tournament.stats.noshow.push({
									id,
									name: R[r].team.names[i],
									school: R[r].school.name,
									division: R[r].school.division
								})
							}
						}
					}
					//-- Display the rror log
					if(this.log.length) {
						console.err(this.log.join('\n'));
					}
					this.$store.commit(types.SET_TOURNAMENT, tournament);
					// console.log(Q);
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

<style lang="scss" scoped>
	h4 {
		text-shadow: 1px 1px 2px #ccc;
	}
</style>
