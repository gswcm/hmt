<template>
	<b-container fluid class="my-3">
		<b-row align-h="center">
			<b-col cols="12" lg="10" xl="8" class="p-5">
				<img src="../logo.png" class="card-img card-img-top img-fluid" />	
				<h2 class="mt-5">Welcome,</h2>
				<!-- Open registration -->
				<template v-if="isBefore.update">					
					<p class="text-justify">
						This portal is designed to support operation of the upcoming <strong>High School Math Tournament</strong>. The tournament will take place {{dates.event.fromNow()}} on <strong>{{dates.event.format('LL')}}</strong>. 
					</p>
					<h4 class="mt-4">Registration</h4>	
					<p class="text-justify">
						You can <strong>create new</strong> or <strong> revise existing</strong> registration any time <strong>before {{dates.update.format('LL')}}</strong> by visiting this page and clicking button down below. Changes <strong>after the deadline</strong> can only be made by organizers (see <a href="/about">About</a> page for contact information).
					</p>
					<h4 class="mt-4">Payment</h4>
					<p class="text-justify">
						Payment for the tournament has to be received <strong>before the event</strong>. Registrations paid after <strong>{{dates.payment.format('LL')}}</strong> are associated with the late payment fee.
						<span v-if="isBefore.payment" class="text-justify">
							You have <strong>{{dates.payment.fromNow(true).split(/\s+/).join(" more ")}}</strong> to pay the registration <strong>without late fee</strong>.  
						</span>
					</p>
					<p v-if="!isBefore.payment" class="test-justify">
						It seems that payment deadline has already passed. If you didn't pay yet, please do it at your earliest chance --- go to the registration page to see your balance and pay the second (larger) amount. It includes both the cost of registration and the late payment fee.
					</p>
					<div v-if="years.length">
						<h4 class="mt-4">Previous years(s) results</h4>
						<p class="text-justify">
							In the meantime you are welcome to take a look at tournament results from the previous year<span v-if="years.length>1">s</span>:
							<ul class="list-inline d-inline-block">
								<li v-for="(year,index) in years" :key="year" class="list-inline-item">
									<router-link :to="`/archive?year=${year}`" target="_blank">
										{{year}}<span v-if="index < years.length-1">, </span><span v-else>.</span>
									</router-link>
								</li>
							</ul>
						</p>
					</div>
					<b-alert show variant="info" v-if="showStat" class="text-justify mt-4">
						So far we received registrations from <span class="text-danger">{{summary.numTeams}} teams</span> bringing <span class="text-danger">{{summary.numStudents}} students</span>.
					</b-alert>
					<div class="d-flex justify-content-center mt-5">
						<b-btn variant="primary" to="/start">
							Let's Get Started
						</b-btn>
					</div>
				</template>
				<!-- Closed registration -->
				<template v-else>
					<!-- Results not yet released -->
					<template v-if="isBefore.results">	
						<p class="mt-4 text-justify">
							The tournament is just around the corner and we are working on last preparations. Unfortunately we can no longer accept new registrations or revisions. Please contact organizers (see <a href="/about">About</a> page for contact information) should you have any questions or concerns. 
						</p>
						<p class="mt-3 text-justify">
							We will publish <strong>tournament results</strong> at midnight on <strong>{{dates.results.format('LL')}}</strong>.
							<span v-if="years.length">
								In the meantime you are welcome to take a look at tournament results from the previous year<span v-if="years.length>1">s</span>:
								<ul class="list-inline d-inline-block">
									<li v-for="(year,index) in years" :key="year" class="list-inline-item">
										<router-link :to="`/archive?year=${year}`" target="_blank">
											{{year}}<span v-if="index < years.length-1">, </span><span v-else>.</span>
										</router-link>
									</li>
								</ul>
							</span>
						</p>
					</template>
					<!-- Results posted -->
					<template v-else>
						<!-- The cycle has not rolled over -->
						<template v-if="isBefore.close">
							<p class="mt-4 text-justify">
								The tournament is over... you were doing great!
							</p>
							<p class="text-justify">
								How much great? We can help you to decide by providing statistical data grouped by <i>divisions</i> and <i>schools</i>.
							</p>
							<p class="text-justify">
								Tournament results for <router-link to="/stats">this year</router-link><span v-if="years.length">, and {{years.length}} archived year<span v-if="years.length>1">s</span> (<ul class="list-inline d-inline-block">
									<li v-for="(year,index) in years" :key="year" class="list-inline-item">
										<a :href="`/archive?year=${year}`" target="_blank">
											{{year}}<span v-if="index < years.length-1">, </span>
										</a>
									</li>
								</ul>)</span> can be accessed in the <strong>Results</strong> menu on top. 
							</p>
						</template>
						<!-- New cycle started but the new date has not been set -->
						<template v-else>
							<p class="mt-4 text-justify">
								We are rolling this site over to prepare it for the next cycle. Please keep checking it on weekly basis. 
							</p>
							<p class="text-justify">
							In the meantime you are welcome to take a look at historical tournament results for the previous year<span v-if="years.length>1">s</span>:
							<ul class="list-inline d-inline-block">
								<li v-for="(year,index) in years" :key="year" class="list-inline-item">
									<a :href="`/archive?year=${year}`" target="_blank">
										{{year}}<span v-if="index < years.length-1">, </span><span v-else>.</span>
									</a>
								</li>
							</ul>
						</p>
						</template>
					</template>
				</template>		
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
				let event = moment(this.eventDate).startOf('day');
				let payment = moment(event).subtract(1,'months');
				let update = moment(event).subtract(1,'days');
				let results = moment(event).add(1,'days');
				let close = moment(event).add(6,'months');
				return {
					event, payment, update, results, close
				};
			},
			isBefore() {
				let payment = moment().isSameOrBefore(this.dates.payment);
				let update = moment().isBefore(this.dates.update);
				let results = moment().isBefore(this.dates.results);
				let close = moment().isBefore(this.dates.close);
				return { 
					payment, update, results, close 
				};
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

