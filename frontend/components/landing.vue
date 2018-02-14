<template>
	<b-container fluid class="my-3">
		<b-row align-h="center">
			<b-col cols="12" lg="10" xl="8" class="p-5">
				<img src="../logo.png" class="card-img card-img-top img-fluid" />	
				<!-- Open registration -->
				<div v-if="isBefore.update">
					<h3 class="mt-5">Welcome,</h3>
					<p class="text-justify">
						This portal is designed to support registration of School team(s) for the upcoming <strong>High School Math Tournamnet</strong>. This year, the tournament will take place on <strong>{{datesFormatted.event}}</strong>
					</p>
					<h4 class="mt-3">Registration</h4>	
					<p class="text-justify">
						Any time <strong>before</strong> the end of registration period on <strong>{{datesFormatted.update}}</strong> you will be able to revise your registration by re-visiting this page. Any changes <strong>after the deadline</strong> can only be made by organizers (see <a href="/about">About</a> page for contact information).
					</p>
					<h4 class="mt-3">Payment</h4>
					<p class="text-justify">
						Having registration process completed, you will need to pay the amount displayed on the registration page. Deadline for <strong>payment without late fee</strong> is set to <strong>{{datesFormatted.payment}}</strong>. 
					</p>
					<div v-if="years.length">
						<h4 class="mt-3">Previous years(s) results</h4>
						<p class="text-justify">
							In the meantime you are welcome to take a look at tournamnt results from previous year(s):
							<ul>
								<li v-for="year in years" :key="year">
									<router-link :to="`/archive?year=${year}`" target="_blank">
										Year {{year}}
									</router-link>
								</li>
							</ul>
						</p>
					</div>
					<b-alert show variant="info" v-if="showStat" class="text-justify mt-3">
						So far we received registrations from <span class="text-danger">{{summary.numTeams}} teams</span> bringing <span class="text-danger">{{summary.numStudents}} students</span>.
					</b-alert>
					<div class="d-flex justify-content-center mt-5">
						<b-btn variant="primary" to="/start">
							Let's Get Started
						</b-btn>
					</div>
				</div>
				<!-- Closed registration -->
				<div v-else>
					<b-alert variant="warning" show class="mt-5">
						<h4 class="text-center">
							Registration for this year tournament is <strong>closed</strong>. 
						</h4>
					</b-alert>
					<p>
						We will publish <strong>tournament results</strong> at midnight on <strong>{{datesFormatted.results}}</strong>.
					</p>
				</div>		
			</b-col>
		</b-row> 
	</b-container>
</template>

<script>
	import types from '../store/mutations'
	import moment from 'moment';
	import { mapGetters } from 'vuex';
	export default {
		data: () => ({
			showStat: false,
			summary: {}
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
				eventDate: 'getEventDate',
				years: 'getYears'
			}),
			dates() {
				let event = moment(new Date(this.eventDate).toISOString()).startOf('day');
				let payment = moment(event).subtract(1,'months');
				let update = moment(event).subtract(1,'days');
				let results = moment(event).add(1,'days');
				let close = moment(event).add(6,'months');

				console.log(this.eventDate, event.format('LL'));

				return {
					event, payment, update, results, close
				};
			},
			isBefore() {
				let payment = moment().isSameOrBefore(this.dates.payment);
				let update = moment().isBefore(this.dates.update);
				let results = moment().isBefore(this.dates.results);
				let close = moment().isBefore(this.dates.close);
				
				return { payment, update, results, close };
			},
			datesFormatted() {
				return {
					event: this.dates.event.format('LL'),
					results: this.dates.results.format('LL'),
					update: this.dates.update.format('LL'),
					payment: this.dates.payment.format('LL'),
				}
			}
		},
		created() {
			this.$store.commit(types.SET_IS_ADMIN, false);
			this.$store.commit(types.SET_EMAIL, '');
			this.axios.post('/api/statistics')
			.then(response => {
				if(!response.data.status) {
					this.showStat = true;
					this.summary = response.data.summary;
				}
			})
			.catch(error => {
				console.error(error.message);
			}); 
			
		}
	}
</script>

<style>
	.card-img {
		max-width: 75%;
		display: block;
		margin: 0 auto;
	}
	.superscript {
		vertical-align: super;
	}
</style>

