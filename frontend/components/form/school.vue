<template>
	<fieldset class="mt-3">
		<legend :class="[status ? '' : 'text-danger']">
			The School
		</legend>
		<div class="fieldset p-3 bg-light rounded">
			<!-- School name -->
			<b-form-group 																
				label-for="name"
				:state="state(runtime.status.name)"
				class="mt-3">
				<b-row align-v="center">
					<b-col cols="12" sm="auto">
						<label>School name<span class="text-danger">*</span></label>
					</b-col>
					<b-col col sm>
						<b-form-input 
							type="text" 
							:disabled="ro"
							:state="state(runtime.status.name)"
							:value="runtime.value.name"
							@input="update([], 'name', $event)"
							placeholder="don't leave me empty">
						</b-form-input>
					</b-col>		
				</b-row>
			</b-form-group>
			<!-- School division -->
			<b-form-group 										
				label-for="division"
				:state="state(runtime.status.division)">
				<b-row align-v="center">
					<b-col cols="12" sm="auto">
						<label>School division<span class="text-danger">*</span></label>
					</b-col>
					<b-col col sm>
						<b-select 
							:value="runtime.value.division"
							:state="state(runtime.status.division)"
							:disabled="ro"
							@input="update([],'division',$event)">
							<option :value="null">Please select the school division</option>
							<optgroup v-for="optionGroup in Object.keys(options)" :key="optionGroup" :label="options[optionGroup].label">
								<option v-for="option in options[optionGroup].values" :value="option" :key="option">{{option}}</option>
							</optgroup>
						</b-select>
					</b-col>
				</b-row>
			</b-form-group>
		</div>
	</fieldset>
</template>

<script>
const { cloneDeep } = require("lodash");
import * as params from "../../../configs/params";
export default {
	props: {
		value: Object,
		ro: {
			type: Boolean,
			default: false
		}
	},
	data: () => ({
		runtime: {
			value: {},
			status: {}
		},
		status: false,
	}),
	computed: {
		options() {
			return params.D;
		}
	},
	created() {
		this.runtime.value = cloneDeep(this.value);
		Object.keys(this.runtime.value).forEach(key => {
			this.runtime.status[key] = this.validate(key);
		});
		this.update();
	},
	watch: {
		value() {
			this.runtime.value = cloneDeep(this.value);
		}
	},
	methods: {
		update(path = [], key, value) {
			let query = [...path, key][0];
			if (query) {
				path.reduce((target, key) => target[key], this.runtime.value)[key] = value;
				this.runtime.status[query] = this.validate(query);
			}
			this.status = Object.keys(this.runtime.status).reduce((a, i) => a && this.runtime.status[i],true);
			this.$emit("input", {
				value: cloneDeep(this.runtime.value),
				status: this.status
			});
		},
		validate(query) {
			let subj = this.runtime.value[query];
			switch (query) {
				case "name":
					return subj.length > 0
				case "division":
					return subj !== null;
			}
		},
		state(isValid) {
			return isValid ? null : false;
		}
	}
};
</script>

<style>
	.form-control:focus,
	.form-control.is-invalid:focus,
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
	.disabled,
	:disabled {
		cursor: not-allowed;
	}
	.superscript {
		vertical-align: super;
	}
</style>

