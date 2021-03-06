<template>
	<b-container fluid>
		<b-form v-show="!authenticated" @submit.prevent="credentialChecker" class="d-print-none">
			<b-form-group :class="['login', 'my-3', 'p-3', 'bg-warning', 'rounded']">
				<b-row>
					<b-col cols="12" md>
						<b-row align-v="center" class="my-2">
							<b-col cols="12" sm="3" md="auto">
								<label><strong>E-mail</strong></label>
							</b-col>
							<b-col col sm>
								<b-form-input type="text" @input="credentialChecker('email',$event)" :value="email || ''" placeholder="admin's e-mail">
								</b-form-input>
							</b-col>
						</b-row>
					</b-col>
					<b-col cols="12" md>
						<b-row align-v="center" class="my-2">
							<b-col cols="12" sm="3" md="auto">
								<label><strong>Password</strong></label>
							</b-col>
							<b-col col sm>
								<b-input-group>
									<b-form-input type="password" ref="password" class="border-right-0" @input="credentialChecker('password',$event)" placeholder="admin's password"/>
									<template slot="append">
										<b-btn :disabled="!emailIsValid" variant="outline-dark" class="border-left-0" v-b-modal.passwordRecovery>forgotten...</b-btn>
									</template>
								</b-input-group>
							</b-col>
						</b-row>
					</b-col>
				</b-row>
			</b-form-group>
		</b-form>
		<b-modal id="passwordRecovery" title="Forgotten your password?" ok-title="Confirm" cancel-title="Close" @ok="sendRecoveryEmail">
			<p>
				We will send an e-mail with password recovery link to <strong>{{credentials.email}}</strong>. Please confirm your will or close this dialog to cancel recovery process.
			</p>
		</b-modal>
		<div v-if="authenticated" class="mt-3">
			<div class="d-flex justify-content-center" >
				<h3 class="p-3">Admin interface</h3>
			</div>
			<b-tabs >
				<!-- Registrations: view and print -->
				<b-tab title="<span class='d-none d-sm-inline-block'>Records</span><span class='d-inline-block d-sm-none'>Rec<span class='shorten'>ords</span></span>" active>
					<records :credentials="credentials"/>
				</b-tab>
				<!-- Questions: edit -->
				<b-tab title="<span class='d-none d-sm-inline-block'>Questions</span><span class='d-inline-block d-sm-none'>Q<span class='shorten'>uestions</span></span>">
					<questions/>
				</b-tab>
				<!-- Scantron: integration with scantron -->
				<b-tab title="<span class='d-none d-sm-inline-block'>Scantron</span><span class='d-inline-block d-sm-none'>Scan<span class='shorten'>trontron</span></span>">
					<scantron :credentials="credentials"/>
				</b-tab>
				<!-- Results -->
				<b-tab title="<span class='d-none d-sm-inline-block'>Results</span><span class='d-inline-block d-sm-none'>Res<span class='shorten'>ults</span></span>">
					<results/>
				</b-tab>
				<!-- Maintenance -->
				<b-tab title="<span class='d-none d-sm-inline-block'>Maintenance</span><span class='d-inline-block d-sm-none'>Maint<span class='shorten'>enance</span></span>" title-item-class="ml-auto">
					<maintenance/>
				</b-tab>
			</b-tabs>
		</div>

		<b-alert v-else show variant="warning">
			<p class="text-justified">
				This banner will be replaced with the real admin interface as soon as you provide correct credentials. So keep on trying...
			</p>
		</b-alert>
	</b-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { debounce } from 'lodash';
import types from '../../store/mutations';
import records from './records.vue';
import questions from './questions.vue';
import scantron from './scantron.vue';
import maintenance from '../maintenance/index.vue';
import results from '../results/index.vue';
export default {
	data: () => ({
		credentials: {
			email: "",
			password: ""
		},
		authenticated: false,
		registrations: []
	}),
	components: {
		records, questions, scantron, maintenance, results
	},
	created() {
		this.credentials.email = this.email || '';
		this.credentialChecker();
	},
	mounted() {
		if(typeof this.$nextTick === 'function') {
			this.$nextTick(() => {
				let el = this.$refs.password;
				if(el) {
					el.focus();
				}
			});
		}
	},
	// beforeRouteEnter(to, from, next) {
	// 	next(vm => {
	// 		if(!vm.isAdmin) {
	// 			vm.$router.replace('/start');
	// 		}
	// 	});
	// },
	computed: {
		...mapGetters({
			isAdmin: "getIsAdmin",
			email: "getEmail"
		}),
		credentialsReady() {
			return Object.keys(this.credentials).reduce(
				(a, i) => a && this.credentials[i].length > 0,
				true
			);
		},
		emailIsValid() {
			return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,8}$/.test(
				this.credentials.email
			);
		}
	},
	methods: {
		sendRecoveryEmail(e) {
			this.axios
			.post("/api/admin/password/request", {
				email: this.credentials.email
			})
			.then(response => {
				if (response.data.status) {
					//-- server error
					let error = response.data.error || new Error("not sure");
					throw error;
				} 
				else {
					this.$noty.success(`Password recovery e-mail has been sent`);
				}
			})
			.catch(error => {
				this.$noty.error(
					`Something went wrong... more specifically: ${error.message}`
				);
				console.error(error.stack);
			});
		},
		credentialChecker: debounce(function(source, value) {
			if (source in this.credentials) {
				this.credentials[source] = value;
			}
			if (this.credentialsReady) {
				this.$store.commit(types.SET_CREDENTIALS, this.credentials);
				this.authenticated = false;
				this.$store.commit(types.SET_IS_ADMIN, false);
				this.axios.post("/api/admin/eval", this.credentials)
				.then(response => {
					if (response.data.status) {
						//-- server error
						let error = response.data.error || new Error("not sure");
						throw error;
					} 
					else {
						this.authenticated = true;
						this.$store.commit(types.SET_IS_ADMIN, true);
					}
				})
				.catch(error => {
					console.error(error.message);
				});
			}
		}, 500)
	}
};
</script>

<style>
	.login {
	}
	.form-control,
	.form-control:focus {
		border: 1px solid #343a40;
	}
	.form-control:focus,
	.form-control.is-invalid,
	.btn:focus {
		outline: 0;
		box-shadow: none;
	}
	.nav-tabs .nav-link:not(.active) .shorten {
		display: none;
	}
</style>

