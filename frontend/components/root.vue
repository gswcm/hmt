<template>
	<div class="root">
		<b-navbar sticky toggleable="md" type="dark" variant="dark" class="d-print-none">
			<b-nav-toggle target="nav_collapse"></b-nav-toggle>
			<b-navbar-brand to="/">
				<span class="d-none d-md-inline-block">
					The Jay Cliett and Bill Kipp 
					<br class="my-0 d-inline-block d-lg-none"/>
					<small>GSW School Mathematics Tournament 2018 @ GSW</small>
				</span>
				<span class="d-inline-block d-md-none">
					Cliett and Kipp <br class="d-sm-none"/>GSW Math Tournament 2018
				</span>
			</b-navbar-brand>
			<b-collapse is-nav id="nav_collapse">
				<b-navbar-nav class="ml-auto">
					<b-nav-item href="/stats">Results</b-nav-item>
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
	export default {
		data: () => ({
		}),
		computed: {
			...mapGetters({
				isAdmin: 'getIsAdmin',
			})
		},
	}
</script>

<style>
	.root {
		min-width: 420px;
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
			/* width: 800px; */
		}
		.card-header {
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

