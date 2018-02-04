import vue from 'vue';
import vuex from 'vuex';
import types from './mutations';

const state = {
	isAdmin: false,
	email: '',
	tournament: null
};
const getters = {
	getIsAdmin: (state) => state.isAdmin,
	getEmail: (state) => state.email,
	getTournament: (state) => state.tournament,
};
const actions = {
};
const mutations = {
	[types.SET_IS_ADMIN]: (state, isAdmin) => {
		state.isAdmin = isAdmin;
	},
	[types.SET_EMAIL]: (state, email) => {
		state.email = email;
	},
	[types.SET_TOURNAMENT]: (state, tournament) => {
		state.tournament = tournament;
	},
};

vue.use(vuex);
export default new vuex.Store({
	state,
	getters,
	actions,
	mutations
});