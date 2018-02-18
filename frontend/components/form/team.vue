<template>
	<fieldset class="mt-3">
		<legend :class="[status ? '' : 'text-danger']">
			The Team
		</legend>
		<div class="fieldset p-3 bg-light rounded">
			<!-- Names -->
			<b-row align-h="between" align-v="center" class="my-3">
				<b-col cols="auto">
					<h5 class="text-info">Members <small v-show="!ro && !isAdmin">(see note below)</small></h5>
				</b-col>
				<b-col cols="auto" v-show="!ro">
					<b-btn 
						variant="outline-info"
						@click="addName">
						Add more...
					</b-btn>
				</b-col>
			</b-row>
			<!-- Main team -->
			<b-alert show variant="success" class="mb-0" v-b-tooltip.hover title="Main team">
				<b-form-group 					
					v-for="(name,index) in runtime.value.names.filter((e,i) => (i < studentsPerTeam))"
					:key="`name_${index}`">							
					<b-row align-v="center">
						<b-col cols="12" sm="auto">	
							<label >Student name {{index+1}}</label>
						</b-col>
						<b-col col sm>
							<b-form-input 
								type="text" 
								:disabled="ro"
								:value="name"
								:state="!/^\s*$/.test(name) ? null : false"
								@input="update(['names'],`${index}`,$event)"
								placeholder="don't leave me empty">
							</b-form-input>		
						</b-col>
						<b-col cols="auto" sm="auto" v-show="!ro">
							<b-btn 
								:disabled="runtime.value.names.length < 3"
								variant="outline-secondary" 
								@click="removeName(index)">
								Remove
							</b-btn>
						</b-col>
					</b-row>
				</b-form-group>				
			</b-alert>			
			<!-- Secondary team(s) -->
			<b-alert v-if="runtime.value.names.length > studentsPerTeam" show variant="light" class="mt-0">
				<b-form-group 					
					v-for="(name,index) in runtime.value.names.filter((e,i) => (i >= studentsPerTeam))"
					:key="`name_${index+studentsPerTeam}`">							
					<b-row align-v="center">
						<b-col cols="12" sm="auto">	
							<label >Student name {{index+studentsPerTeam+1}}</label>
						</b-col>
						<b-col col sm>
							<b-form-input 
								type="text" 
								:disabled="ro"
								:value="name"
								:state="!/^\s*$/.test(name) ? null : false"
								@input="update(['names'],`${index+studentsPerTeam}`,$event)"
								placeholder="don't leave me empty">
							</b-form-input>		
						</b-col>
						<b-col cols="auto" sm="auto" v-show="!ro">
							<b-btn 
								:disabled="runtime.value.names.length < 3"
								variant="outline-secondary" 
								@click="removeName(index+studentsPerTeam)">
								Remove
							</b-btn>
						</b-col>
					</b-row>
				</b-form-group>
			</b-alert>			
			<p v-if="!ro && !isAdmin" class="mt-3 pl-3 border border-bottom-0 border-top-0 border-right-0 border-dark">
				<strong>Note</strong>: The team registration cost is calculated based on the number of participants and payment date:
				<ul>
					<li>
						If paid <strong>before {{dates.payment.format('LL')}}</strong>.
						The cost is <strong>$75</strong> for the first 8 members (main team) and <strong>$5</strong> for each extra participants
					</li>
					<li>
						If paid <strong>after {{dates.payment.format('LL')}}</strong>.
						The cost is <strong>$100</strong> for the first 8 members (main team) and <strong>$5</strong> for each extra participants
					</li>
				</ul>
				The <strong>Total</strong> amount below is adjusted to account today's date.
			</p>	
			<hr class="my-4">
			<!-- T-Shirts -->
			<b-row align-h="between" align-v="center" class="my-3" v-show="showTShirts">
				<b-col cols="auto">
					<h5 class="text-info">T-Shirts <small>($10 each)</small> </h5>
				</b-col>
				<b-col cols="auto" v-show="!ro">
					<b-btn 
						variant="outline-info"
						@click="addTShirt">
						Add more...
					</b-btn>
				</b-col>
			</b-row>
			<b-form-group 	
				v-for="(tshirt,index) in runtime.value.tshirts"
				:key="`tshirt_${index}`"
				v-show="showTShirts">						
				<b-row align-v="center">
					<b-col col sm="auto">	
						<label>Size/Qty</label>
					</b-col>
					<b-col col sm>
						<b-select 
							:disabled="ro"
							:value="tshirt.size"
							:state="tshirt.size !== null ? null : false"
							@input="update(['tshirts',`${index}`],'size',$event)">
							<option :value="null">Please select t-shirt size</option>
							<option v-for="option in tShirtSizes.values" :value="option" :key="option">{{option}}</option>
						</b-select>
					</b-col>
					<b-col cols="2">
						<b-form-input 
							:disabled="ro"
							type="number" 
							min="0"
							:value="tshirt.qty"
							@input="update(['tshirts',`${index}`],'qty',$event)"
							:state="tshirt.qty > 0 ? null : false">
						</b-form-input>	
					</b-col>
					<b-col col sm="auto" v-show="!ro">
						<b-btn 
							variant="outline-secondary" 
							@click="removeTShirt(index)">
							Remove
						</b-btn>
					</b-col>
				</b-row>
			</b-form-group>
			<hr class="my-4" v-show="showTShirts && showMeals">
			<!-- Meals -->
			<b-row align-h="between" align-v="center" class="my-3" v-show="showMeals">
				<b-col cols="auto">
					<h5 class="text-info">Meals <small>($7.5 each)</small></h5>
				</b-col>
			</b-row>
			<b-form-group v-show="showMeals"> 	
				<b-row align-v="center">
					<b-col cols="auto" sm="auto">	
						<label>Number of meal tickets</label>
					</b-col>
					<b-col col sm="">
						<b-form-input 
							:disabled="ro"
							type="number" 
							min="0"
							:value="runtime.value.meals"
							:state="state(runtime.status.meals)"
							@input="update([],'meals',$event)">
						</b-form-input>	
					</b-col>
				</b-row>
			</b-form-group>
		</div>
	</fieldset>
</template>

<script>
	import moment from 'moment';
	import * as params from "../../../configs/params";
	import { mapGetters } from 'vuex';
	const { cloneDeep } = require('lodash');
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
			...mapGetters({
				eventDate: 'getEventDate',
				isAdmin: 'getIsAdmin'
			}),
			studentsPerTeam() {
				return params.studentsPerTeam;
			},
			tShirtSizes() {
				return params.T;
			},
			dates() {
				let event = moment(this.eventDate).startOf('day');
				let payment = moment(event).subtract(1,'months');
				return {
					event, payment
				};
			},
			showTShirts() {
				return !this.ro || (this.ro && this.runtime.value.tshirts.length > 0)
			},
			showMeals() {
				return !this.ro || (this.ro && parseInt(this.runtime.value.meals) > 0)
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
			removeName(index) {
				this.runtime.value.names.splice(index,1); 
				this.runtime.status.names = this.validate('names');
				this.update();
			},
			addName() {
				this.runtime.value.names.push('');
				this.runtime.status.names = this.validate('names');
				this.update();
			},
			removeTShirt(index) {
				this.runtime.value.tshirts.splice(index,1); 
				this.runtime.status.tshirts = this.validate('tshirts');
				this.update();
			},
			addTShirt() {
				this.runtime.value.tshirts.push({
					size: null,
					qty: 1
				});
				this.runtime.status.tshirts = this.validate('tshirts');
				this.update();
			},
			update(path = [], key, value) {
				let query = [...path, key][0];
				if(query) { 
					path.reduce((target,key) => target[key],this.runtime.value)[key] = value;
					this.runtime.status[query] = this.validate(query)
				}
				this.status = Object.keys(this.runtime.status).reduce((a,i) => a && this.runtime.status[i], true);
				this.$emit('input', {
					value: cloneDeep(this.runtime.value),
					status: this.status
				});
			},
			validate(query) {
				let subj = this.runtime.value[query];
				switch (query) {
					case "meals":
						return /[0-9]+/.test(subj) && parseInt(subj) >= 0; 
					case "tshirts":
						return subj.reduce((a,i) => a && (i.size !== null) && (i.qty > 0), true);
					case "names":
						return subj.reduce((a,i) => a && !/^\s*$/.test(i), true);
				}
			},
			state(isValid) {
				return isValid ? null : false;
			},
		},
	}
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
</style>

