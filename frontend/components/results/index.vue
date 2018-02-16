<template>
	<div class="p-3">
		<div class="d-flex flex-column align-items-center d-print-none">
			<h4 v-if="'year' in $route.query" class="my-3">Archive for {{$route.query.year}} year</h4>
			<h4 @click="refresh"> Tournament results are categorized and displayed below</h4>
		</div>
		<b-tabs v-if="tournament" pills card class="mt-3">
			<b-tab active title="<span class='d-none d-sm-inline-block'>Tournament</span><span class='d-inline-block d-sm-none'>T<span class='shorten'>ournament</span></span>"><tournament/></b-tab>
			<b-tab title="<span class='d-none d-sm-inline-block'>Divisions</span><span class='d-inline-block d-sm-none'>D<span class='shorten'>ivisions</span></span>"><divisions/></b-tab>
			<b-tab title="<span class='d-none d-sm-inline-block'>Schools</span><span class='d-inline-block d-sm-none'>S<span class='shorten'>chools</span></span>"><schools class=""/></b-tab>
			<b-tab v-if="isAdmin && tournament" title="Log" title-item-class="ml-auto"><logs/></b-tab>
		</b-tabs>
		<b-alert v-else variant="warning" show class="mt-3">
			<h5>
				No records found
			</h5>
		</b-alert>
	</div>
</template>

<script>
import { pick } from "lodash";
import { sprintf } from "sprintf-js";
import { mapGetters } from 'vuex';
import moment from 'moment';
import * as params from "../../../configs/params"
import tournament from "./tournament.vue";
import divisions from "./divisions.vue";
import schools from "./schools.vue";
import logs from "./logs.vue";
import types from '../../store/mutations';
export default {
	props: {
	},
	data: () => ({
		log: [],
	}),
	components: {
		tournament, divisions, schools, logs
	},
	created() {
		this.refresh();
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			// if(!vm.isAdmin) {
				if(!vm.$route.query.year && (vm.isBefore.results || !vm.isBefore.close)) {
					vm.$router.replace('/');
				}
			// }
		});
	},
	watch: {
	},
	computed: {
		...mapGetters({
			isAdmin: 'getIsAdmin',
			tournament: 'getTournament',
			eventDate: 'getEventDate',
		}),
		dates() {
			let event = moment(this.eventDate).startOf('day');
			let results = moment(event).add(1,'days');
			let close = moment(event).add(6,'months');
			return {
				event, results, close
			};
		},
		isBefore() {
			let results = moment().isBefore(this.dates.results);
			let close = moment().isBefore(this.dates.close);
			return { 
				results, close 
			};
		}
	},
	methods: {
		process({R,Q,S,C}) {
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
			let tournament = { 
				divisions: {}, 
				stats: {},
				log: []
			};
			let show = [];
			for(let i=0; i<S.length; i++) {				
				let id = S[i].substr(0,4);
				let answers = S[i].substr(4,40).split("").map(i => parseInt(i));
				let seq = id.substr(0,2);
				//-- Populate 'Student' object based on identified ID
				if(!(seq in R)) {
					tournament.log.push(`Incorrect registration record '${S[i]}', i.e. '${seq}' in '${id}' is an invalid school identity`);
					continue;
				}
				show.push(id);						
				let reg = R[seq];
				//-- Teams with more than 8 members (params.studentsPerTeam) must be split to introduce ALT teams
				let schoolName = reg.school.name
				let studentIndexInSchool = parseInt(id.substr(2,2))
				if(studentIndexInSchool >= reg.team.names.length) {
					tournament.log.push(`Incorrect registration record '${S[i]}', i.e. '${id.substr(2,2)}' in '${id}' references non-existent student`);
					continue;
				}
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
				let divisions = tournament.divisions;
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
					school.stats.ciphering = (C.find(i => i.division === divisionKey && i.school === schoolKey) || {value:0}).value;
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
			//-- Post the changes into VUEX store					
			this.$store.commit(types.SET_TOURNAMENT, tournament);
			if(this.isAdmin) {
				console.log(JSON.parse(JSON.stringify(tournament)));
			}
		},
		refresh() {
			this.axios
			.post("/api/results/get", { year: ('year' in this.$route.query) ? this.$route.query.year : null })
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.process(response.data.rqsc);
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
	h4 {
		text-shadow: 1px 1px 2px #ccc;
	}
	.card-header .nav-link:not(.active) .shorten {
		display: none;
	}
</style>
