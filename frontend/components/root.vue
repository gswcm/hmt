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
					<b-nav-item-dropdown text="Results" right>
						<b-dropdown-item href="/stat">This year</b-dropdown-item>
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
	export default {
		data: () => ({
			years: []
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
				deadlines: 'getDeadlines'
			})
		},
		created() {
			this.getYears()
			this.getDeadlines();
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
					else {
						this.years = response.data.archives.map(e => e.year);
					}
				})
				.catch(error => {
					this.$noty.error(
						`Something went wrong... more specifically: ${error.message}`
					);
					console.error(error.stack);
				});
			},
			getDeadlines() {
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
						if(response.data.timeline && response.data.timeline.deadlines) {
							this.$store.commit(types.SET_DEADLINES, response.data.timeline.deadlines);
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
		.root {
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

