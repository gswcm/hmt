<template>
	<div>
		<div class="bg-light p-3 text-info border-info border" v-if="options.debug">
			<pre>{{JSON.stringify(runtime,null,3)}}</pre>	
			<pre>{{JSON.stringify(status,null,3)}}</pre>	
		</div>
		<sponsor
			:value="runtime.value.sponsor"
			:ro="options.ro"
			@input="update('sponsor', $event)">
		</sponsor>
		<school
			:value="runtime.value.school"
			:ro="options.ro"
			@input="update('school', $event)">
		</school>
		<team
			:value="runtime.value.team"
			:ro="options.ro"
			@input="update('team', $event)">
		</team>
		<b-row align-h="end">
			<b-col cols="auto" >
				<h2 class="p-3">Total: {{total}}</h2>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	import { mapGetters } from "vuex";
	import moment from 'moment';
	import { cloneDeep } from 'lodash';
	import sponsor from './sponsor.vue';
	import team from './team.vue';
	import school from './school.vue';
	export default {
		components: {
			sponsor, team, school
		},
		props: {			
			value: Object,
			options: {
				type: Object,
				default: () => ({
					debug: false,
					ro: false
				})
			}
		},
		data: () => ({
			runtime: {
				value: {},
				status: {}
			},
			status: false,
			total: ""
		}),
		computed: {
			...mapGetters({
				eventDate: 'getEventDate',
			}),
			dates() {
				let event = moment(this.eventDate).startOf('day');
				let payment = moment(event).subtract(1,'months');
				return {
					event, payment
				};
			},
		},
		created() {
			this.runtime.value = cloneDeep(this.value);
		},
		watch: {
			value() {
				this.runtime.value = cloneDeep(this.value);
			}
		},
		methods: {
			update(key, data) {
				if(key) {
					this.runtime.value[key] = cloneDeep(data.value);
					this.runtime.status[key] = data.status;
				}
				this.status = Object.keys(this.runtime.status).reduce((a,i) => a && this.runtime.status[i], true);
				this.$emit('input', {
					value: cloneDeep(this.runtime.value),
					status: this.status
				});
				this.updateTotal()
			},
			updateTotal() {
				if(this.status) {
					let base = this.runtime.value;
					let tshirts = base.team.tshirts.reduce((a,i) => a + parseInt(i.qty), 0) * 10;
					let meals = parseInt(base.team.meals) * 7.5;	
					let arr = [75,100].map(i => meals + tshirts + ((base.team.names.length < 9) ? i : i + (base.team.names.length - 8) * 5));
					this.total = moment().isBefore(this.dates.payment) ? `\$${arr[0]}` : `\$${arr[1]}`;
				}
				else {
					this.total = "N/A";
				}
			}
		},
	}
</script>

