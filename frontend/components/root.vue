<template>
	<div class="root">
		<b-navbar sticky toggleable="md" type="dark" variant="dark">
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
</style>

