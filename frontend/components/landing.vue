<template>
	<b-container fluid class="my-3">
		<b-row align-h="center">
			<b-col cols="12" lg="10" xl="8">
				<b-card					
					bg-variant="transparent"
					class="border-0">
					<img src="../logo.png" class="card-img card-img-top img-fluid" />					
					<!-- Open registration -->
					<b-card-body
						v-if="registrationOpen"
						title="Welcome"
						sub-title="Thank you for using our registration portal">
						<p class="card-text mt-3 text-justify">
							This portal is designed to support registration of School team(s) for the upcoming <strong>High School Math Tournamnet</strong>. You will always be able to revise the registration by visiting this application again and using the same e-mail address. Tournament results will be posted here as well.
						</p>
						<hr>
						<b-alert show variant="info">
							<p v-if="showStat" class="text-center">
								So far we received registrations from <span class="text-danger">{{summary.numTeams}} teams</span> bringing <span class="text-danger">{{summary.numStudents}} students</span>.
							</p>
						</b-alert>
						<div class="d-flex justify-content-center">
							<b-btn variant="primary" to="/start">
								Let's Get Started
							</b-btn>
						</div>
					</b-card-body>
					<!-- Closed registration -->
					<b-card-body v-else>
						<b-alert variant="warning" show class="mt-5">
							<h4 class="text-center">
								Registration for this year tournament is <strong>closed</strong>. 
							</h4>
						</b-alert>
						<p>
							We will publish tournament results at midnight on {{deadlines.releaseResults}}
						</p>
					</b-card-body>	
				</b-card>				
			</b-col>
		</b-row> 
	</b-container>
</template>

<script>
	import types from '../store/mutations'
	import { mapGetters } from 'vuex';
	export default {
		data: () => ({
			showStat: false,
			summary: {}
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
			}),
			registrationOpen() {
				return true;
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

