<template>
	<div class="p-4">
		<b-row>
			<b-col cols="12" sm="" class="">
				<b-textarea :value="scanString" @input="scanUpdated" :rows="10" :max-rows="20" wrap="off" class="bg-light" :no-resize="true" placeholder="Scantron"/>
			</b-col>
			<b-col cols="auto" class="d-none d-sm-flex flex-column justify-content-center">
				<b-btn variant="outline-dark" @click="scanToEval">
					<!-- <i class="fa fa-chevron-right" aria-hidden="true"></i> -->
					<font-awesome-icon :icon="['fas', 'angle-double-right']"/>
				</b-btn>
			</b-col>
			<b-col cols="12" class="d-block d-sm-none my-3">
				<b-btn class="mx-auto d-block" variant="outline-dark" @click="scanToEval">
					<!-- <i class="fa fa-chevron-down" aria-hidden="true"></i> -->
					<font-awesome-icon :icon="['fas', 'angle-double-down']"/>
				</b-btn>
			</b-col>
			<b-col cols="12" sm="" class="" >
				<b-textarea :value="evalString" @input="evalUpdated" :rows="10" :max-rows="20" wrap="off" class="bg-light" :no-resize="true" placeholder="Evaluation"/>
			</b-col>
		</b-row>
		<div class="mt-3 d-flex justify-content-end">
			<b-btn variant="outline-dark" @click="evalProcess">
				<!-- <i class="fa fa-question" aria-hidden="true"></i> -->
				<font-awesome-icon :icon="['fas', 'question-circle']"/>
				Test
			</b-btn>
			<b-btn variant="outline-dark" class="ml-3">
				<!-- <i class="fa fa-floppy-o" aria-hidden="true"></i> -->
				<font-awesome-icon :icon="['fas', 'save']"/>
				Save
			</b-btn>
			<b-btn variant="outline-dark" class="ml-3" @click="evalData = []">
				<!-- <i class="fa fa-trash-o" aria-hidden="true"></i> -->
				<font-awesome-icon :icon="['fas', 'trash-alt']"/>
				Clear
			</b-btn>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		credentials: Object
	},
	data: () => ({
		runtime: {
			credentials: {}
		},
		scanData: ["100500","1234JKGJG"],
		evalData: [],
	}),
	created() {
		this.runtime.credentials = this.credentials;
	},
	computed: {
		scanString() {
			return this.a2s(this.scanData);
		},
		evalString() {
			return this.a2s(this.evalData, true);
		}
	},
	watch: {
		credentials() {
			this.runtime.credentials = this.credentials;
		}
	},
	methods: {
		s2a(s, strict = false) {
			s = s.replace(/[^0-9A-Z\n]/g,'');
			if(strict) {
				s = s.replace(/\n+/g,'\n')
			}
			let a = s.split(/\n/);
			if(a.length === 1 && !a[0].length) {
				a = [];
			}
			return a;
		},
		a2s(a) {
			return a.join('\n');
		},  
		scanUpdated(value) {
			this.scanData = this.s2a(value);
		},
		evalUpdated(value) {
			this.evalData = this.s2a(value, true);
		},
		scanToEval() {
			this.evalData = this.scanData.filter(i => /[0-9]{4,}/g.test(i));
		},
		evalProcess() {
			console.log(JSON.stringify(this.evalData, null, 3));
		},
	}
};
</script>