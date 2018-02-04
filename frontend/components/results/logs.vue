<template>
	<div class="p-3">
		<h5 class="">
			No-show participants
		</h5>
		<b-input-group>
			<b-form-input :value="filter" @input="filterUpdate" placeholder="Filter by 'id' or 'name'" />
			<b-input-group-button>
				<b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
			</b-input-group-button>
		</b-input-group>
		<b-table 
			class="mt-3"
			:fields="fields" 
			:items="t.stats.noshow" 
			:filter="filterHandler"
			responsive="sm"
			head-variant="dark"
			striped
			hover>
		</b-table>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import * as params from "../../../configs/params";
import types from "../../store/mutations";
import { debounce } from "lodash";
export default {
	data: () => ({
		fields: [
			{ key: "id", label: "ID", sortable: true },
			{ key: "name", sortable: true, tdClass: "nowrap" },
			{ key: "school", sortable: true, tdClass: "nowrap" },
			{ key: "division", sortable: true, tdClass: "nowrap" }
		],
		filter: null
	}),
	computed: {
		...mapGetters({
			t: "getTournament"
		})
	},
	methods: {
		filterUpdate: debounce(function(value) {
			this.filter = value;
		}, 500),
		filterHandler(item) {
			//-- Match by ID
			let matchID = false;
			if(this.filter) {
				if(this.filter.length === 4) {
					matchID = item.id === this.filter;
				}
				else if(/^\d{5,}/.test(this.filter)) {
					matchID = item.id === this.filter.substr(0,4);
				}
				else if(/^\d{1,4}/.test(this.filter)) {
					matchID = item.id.substr(0,this.filter.length) === this.filter;
				}
			}
			// Match by name
			let matchName = false;
			if(this.filter && /^[a-z\s-]{1,}/gi.test(this.filter)) {
				matchName = item.name.split(/\s+/g).reduce((a,p) => {
					return a || new RegExp("^" + p.replace(/[^a-z-]/gi,'').split("").join("?") + "?$", "i").test(this.filter);
				}, false);
			}
			// Return result
			return !this.filter || !this.filter.length || matchID || matchName;
		},

	}
};
</script>

<style >
h4,
h5 {
	text-shadow: 1px 1px 2px #ccc;
}
.th > span {
	font-size: small;
	vertical-align: super;
}
.correct {
	font-weight: bold;
}
.nowrap {
	white-space: nowrap;
}
</style>
