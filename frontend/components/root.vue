<template>
	<div class="root">
		<b-navbar sticky toggleable="md" type="dark" variant="dark" class="d-print-none">
			<b-nav-toggle target="nav_collapse"></b-nav-toggle>
			<b-navbar-brand to="/">
				<span class="d-none d-md-inline-block">
					The Jay Cliett and Bill Kipp 
					<br class="my-0 d-inline-block d-lg-none"/>
					<small>GSW School Mathematics Tournament @ GSW</small>
				</span>
				<span class="d-inline-block d-md-none">
					Cliett and Kipp <br class="d-sm-none"/>GSW Math Tournament
				</span>
			</b-navbar-brand>
			<b-collapse is-nav id="nav_collapse">
				<b-navbar-nav class="ml-auto">
					<b-nav-item-dropdown v-if="years.length || !isBefore.results" text="Results" right>
						<b-dropdown-item v-if="!isBefore.results && isBefore.close" href="/stat">This year</b-dropdown-item>
						<b-dropdown-header v-if="years.length">Archived years(s)</b-dropdown-header>
						<b-dropdown-item v-if="years.length" v-for="year in years" :key="year" :href="`/archive?year=${year}`">{{year}}</b-dropdown-item>
					</b-nav-item-dropdown>
					<b-nav-item href="/about">About</b-nav-item>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
		<!-- <keep-alive> -->
		<router-view></router-view>
		<!-- </keep-alive> -->
	</div>
</template>

<script>
	import { mapGetters } from 'vuex';
	import types from '../store/mutations';
	import moment from 'moment';
	export default {
		data: () => ({			
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
				eventDate: 'getEventDate',
				years: 'getYears'
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
		created() {
			this.getYears()
			this.getEventDate();
		},
		methods: {
			getYears() {
				//-- Retrieve list of archived years
				this.axios
				.post("/api/results/years")
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else if(Array.isArray(response.data.archives) && response.data.archives.length){
						this.$store.commit(types.SET_YEARS, response.data.archives.map(e => e.year).sort());
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			},
			getEventDate() {
				this.axios
				.post("/api/mtn/timeline", {
					update: false
				})
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						if(response.data.timeline && response.data.timeline.eventDate) {
							this.$store.commit(types.SET_EVENT_DATE, response.data.timeline.eventDate);
						}
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
	}
</script>

<style>
	.root {
		min-width: 420px;
	}
	a.dropdown-item:focus {
		outline: 0;
		box-shadow: none;
	}
	a.dropdown-item:hover {
		font-weight: bold;
		background-color: rgb(33,37,41);
		color: white;
	}
	@media print {
		@page {			
			margin: 0mm;  /* this affects the margin in the printer settings */
			margin-top: 10mm;
		}
		@page :first {			
			margin-top: 0mm;
		}
		.card-header,
		.nav-tabs {
			display: none;
		}
		.page-no-break-inside {
			page-break-inside: avoid;
		}
		.page-no-break-after {
			page-break-after: always;
		}
		.page-no-break-before {
			page-break-before: always;
		}
	}
</style>

