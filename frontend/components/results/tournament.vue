<template>
	<div class="p-3">
		<h5>
			Participants
		</h5>
		<hr>
		<p class="pl-3">
			There have been <strong> {{t.stats.scores.values.length}} participants</strong> who submitted their Scantron sheets for processing.  Their <strong>average score</strong> was <strong>{{t.stats.scores.avg.toFixed(2)}}</strong> out of possible 200. The standard <strong>deviation</strong> was <strong>{{t.stats.scores.std.toFixed(2)}}</strong>.
		</p>
		<h5 class="mt-5">
			Per-question statistics
		</h5>
		<p class="pl-3">
			The following table summarizes the number of answers of particular kind to each question, <span class="badge badge-info">marks</span> correct answer, and shows the percentage of the number of correct answers to each question.
		</p>
		<b-table 
			class="mt-3"
			:fields="fields" 
			:items="items" 
			responsive="sm"
			head-variant="dark"
			striped
			hover>
			<template slot="one" slot-scope="data">
				<span :class="data.item.tdOne">{{data.item.one}}</span>
			</template>
			<template slot="two" slot-scope="data">
				<span :class="data.item.tdTwo">{{data.item.two}}</span>
			</template>
			<template slot="three" slot-scope="data">
				<span :class="data.item.tdThree">{{data.item.three}}</span>
			</template>
			<template slot="four" slot-scope="data">
				<span :class="data.item.tdFour">{{data.item.four}}</span>
			</template>
			<template slot="five" slot-scope="data">
				<span :class="data.item.tdFive">{{data.item.five}}</span>
			</template>
		</b-table>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as params from "../../../configs/params"
import types from '../../store/mutations';
export default {
	props: {
	},
	data: () => ({
		fields: [
			{
				key: 'index',
				label: 'Question'
			},
			{
				key: 'blank',
				label: 'Empty'
			},
			{
				key: 'one',
				label: '1<span>st</span>',
				thClass: "th"
			},
			{
				key: 'two',
				label: '2<span>nd</span>',
				thClass: "th"
			},
			{
				key: 'three',
				label: '3<span>rd</span>',
				thClass: "th"
			},
			{
				key: 'four',
				label: '4<span>th</span>',
				thClass: "th"
			},
			{
				key: 'five',
				label: '5<span>th</span>',
				thClass: "th"
			},
			{
				key: 'cat',
				label: 'Category',
				tdClass: 'nowrap'
			},
			{
				key: 'percent',
				label: 'Percent'
			}
		],
	}),
	computed: {
		...mapGetters({
			t: 'getTournament'
		}),
		items() {
			return this.t.stats.questions.origin.map((e,i) => {
				return {
					index: i+1,
					blank: e.counters["0"],
					one: e.counters["1"],
					two: e.counters["2"],
					three: e.counters["3"],
					four: e.counters["4"],
					five: e.counters["5"],
					cat: params.Q[e.cat],
					percent: (e.counters["correct"] / this.t.stats.scores.values.length * 100).toFixed(2),
					tdOne: e.key === 1 ? 'badge badge-info' : '',
					tdTwo: e.key === 2 ? 'badge badge-info' : '',
					tdThree: e.key === 3 ? 'badge badge-info' : '',
					tdFour: e.key === 4 ? 'badge badge-info' : '',
					tdFive: e.key === 5 ? 'badge badge-info' : '',
				};
			});
		}
	},
	methods: {
	}
};
</script>

<style >
	h4,h5 {
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
