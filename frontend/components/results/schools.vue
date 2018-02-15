<template>
	<div class="p-sm-3" ref="schools">
		<b-row class="d-print-none mb-4" align-v="end">
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
				<b-row align-v="end">
					<!-- School -->
					<b-col cols="12">
						<label><strong>School</strong></label>
					</b-col>
					<b-col cols="">
						<b-select v-model="school" :options="schools"/>
					</b-col>
					<b-col cols="auto pl-0">
						<b-btn 
							variant="outline-dark" 
							:disabled="!school"
							@click="printOne">
							<font-awesome-icon :icon="['fas', 'print']"/>
						</b-btn>
					</b-col>
					<b-col cols="auto pl-0">
						<b-btn 
							variant="outline-dark" 
							class=""
							:disabled="!Object.keys(t.divisions).length"
							@click="printAll">
							<font-awesome-icon :icon="['fas', 'print']"/>
							All
						</b-btn>
					</b-col>
				</b-row>
			</b-col>
		</b-row>
		<!-- Bulk print -->
		<div v-if="bulk" class="d-none d-print-block">
			<school 
				v-for="bulkItem in bulk" 
				:t="t" :school="bulkItem.school" :division="bulkItem.division" 
				:key="`${bulkItem.division}_${bulkItem.school}`"
				class="page-no-break-after"/>
		</div>
		<!-- Main display -->
		<school v-if="school" :t="t" :school="school" :division="division" :class="{'d-print-none': bulk}"/>
		<b-alert v-else show variant="warning" class="d-print-none">
			No records found
		</b-alert>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import * as params from "../../../configs/params";
import types from "../../store/mutations";
import school from "./school.vue";
import { debounce } from "lodash";
export default {
	data: () => ({
		division: null,
		school: null,
		bulk: null,
	}),
	components: { school },
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
	},
	methods: {
		printOne() {
			this.bulk = null;
			this.$nextTick(() => {
				window.print();
			})
		},
		printAll() {
			let bulk = [];
			for(let division in this.t.divisions) {
				for(let school in this.t.divisions[division].schools) {
					bulk.push({division,school});
				}
			}
			this.bulk = bulk;
			this.$nextTick(() => {
				window.print();
			})
			
		}
	},
	mounted() {
	},
};
</script>

<style >
h4,
h5 {
	text-shadow: 1px 1px 2px #ccc;
}
.nowrap {
	white-space: nowrap;
}
.banner {
	font-size: xx-large;
	font-weight: bold;
}
</style>
