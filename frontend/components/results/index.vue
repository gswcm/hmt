<template>
	<div class="p-4">
		<b-btn variant="outline-dark" @click="refresh">Refresh</b-btn>
	</div>
</template>

<script>
import { pick } from "lodash";
import * as dict from "../../../configs/dict"
export default {
	props: {
	},
	data: () => ({
		Q: [],
		R: [],
		S: [],
		log: []
	}),
	created() {
	},
	watch: {
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
					let {r,q,s} = {...response.data.rqs};
					//-- inject statistics object into each question
					// console.log(q);
					for(let i of q) {
						i.counters = {
							0: 0,
							1: 0,
							2: 0,
							3: 0,
							4: 0,
							5: 0,
							correct: 0
						};
					}
					// -- Initialize results structure
					let tournament = null;
					// -- Iterate through the list of scantron records
					let stat = s.map(scan => {
						let id = scan.substr(0,4);
						let answers = scan.substr(4,40).split("").map(i => parseInt(i));
						let seq = id.substr(0,2);
						//-- Populate 'Student' object based on identified ID
						if(!(seq in r)) {
							this.log.push(`Scan parsing: incorrect ID in '${scan}' registration record '${seq}' is invalid`);
							return;
						}
						let reg = r[seq];
						let student = {
							id,
							division: reg.school.division,
							school: reg.school.name,
							name: reg.team.names[parseInt(id.substr(2,2))],
							counters: {
								correct: {
									total: 0
								},
								incorrect: 0,
								blank: 0
							}	
						}
						for(let cat in dict.Q) {
							student.counters.correct[cat] = 0;
						}
						//-- Evaluate answers
						for(let i=0; i<answers.length; i++) {
							q[i].counters[answers[i]]++;
							if(answers[i] === 0) {
								student.counters.blank++;
								continue;
							}
							else if(answers[i] === q[i].key) {
								//-- correct answer
								q[i].counters.correct++;
								student.counters.correct.total++;
								student.counters.correct[q[i].cat]++;
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
					});
					//-- print tournament results				
					console.log(JSON.stringify(tournament,null,3));
					//-- Display the rror log
					if(this.log.length) {
						console.log(this.log.join('\n'));
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

