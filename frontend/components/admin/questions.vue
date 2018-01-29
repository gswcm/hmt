<template>
	<div v-if="Q.length" class="p-4">
		<p>Specify category and a correct answer for each question. All changes are saved automatically.</p>
		<b-row class="p-3">
			<template v-for="g in Array.from(Array(2).keys())">
				<b-col cols="12" md="10" lg="8" xl="" :key="`g_${g}`" :class="['bg-light', 'border','p-3','mx-2']">
					<div v-for="q in Array.from(Array(20).keys())" :key="`q_${q}`">
						<b-row :class="!(Q[g*20+q].cat && Q[g*20+q].key) ? 'text-danger' : 'text-default'">
							<b-col cols="1"><strong>{{g*20+q+1}}</strong></b-col>
							<b-col cols="">
								<b-form-select v-model="Q[g*20+q].cat" @input="saveQuestions">
									<option :value="null">--</option>
									<option value="ALGE">Algebra</option>
									<option value="ANGE">Analytical geometry</option>
									<option value="GEOM">Geometry</option>
									<option value="TRIG">Trigonometry</option>
									<option value="MISC">Miscellaneous</option>
								</b-form-select>
							</b-col>
							<b-col cols="3" class="d-block d-md-none">
								<b-form-select v-model="Q[g*20+q].key" @input="saveQuestions">
									<option :value="null">--</option>
									<option :value="1">1</option>
									<option :value="2">2</option>
									<option :value="3">3</option>
									<option :value="4">4</option>
									<option :value="5">5</option>
								</b-form-select>
							</b-col>
							<b-col sm="auto" class="d-none d-md-block">	
								<b-form-radio-group v-model="Q[g*20+q].key">
									<b-form-radio :value="1">1</b-form-radio>
									<b-form-radio :value="2">2</b-form-radio>
									<b-form-radio :value="3">3</b-form-radio>
									<b-form-radio :value="4">4</b-form-radio>
									<b-form-radio :value="5">5</b-form-radio>
								</b-form-radio-group>
							</b-col>
						</b-row>
					</div>
				</b-col>
			</template>
		</b-row>
	</div>
</template>

<script>
import { pick } from "lodash";
export default {
	props: {
		credentials: Object
	},
	data: () => ({
		runtime: {
			credentials: {}
		},
		Q: [],
	}),
	created() {
		this.runtime.credentials = this.credentials;
		this.getQuestions();
	},
	watch: {
		credentials() {
			this.runtime.credentials = this.credentials;
		}
	},
	methods: {
		getQuestions() {
			this.axios
			.post("/api/Q", {
				credentials: this.runtime.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.Q = response.data.questions.map(i => pick(i,['cat','key']));
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		saveQuestions() {
			this.axios
			.post("/api/Q", {
				questions: this.Q,
				credentials: this.runtime.credentials
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
	}
};
</script>

