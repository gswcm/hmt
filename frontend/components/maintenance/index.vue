<template>
	<div class="mt-3 p-3">
		<b-alert show variant="danger">
			This interface is intended for direct manipulation of selected database tables. <strong>Use with caution</strong>. 
		</b-alert>
		<!-- Resequence registrations -->
		<re-sequence/>
		<hr>
		<!-- Remove stale data -->
		<remove-stale/>
		<hr>
		<!-- Remove this year data (registrations, questions, scans) -->
		<remove-this-year/>
		<hr>
		<!-- Archive tournament data -->
		<do-archive/>
		<hr>
		<!-- Set tournament dates -->
		<timeline/>
		<!-- Spacer -->
		<div class="py-5 mt-5"></div>
	</div>
</template>

<script>
import reSequence from './reSequence.vue';
import removeStale from './removeStale.vue';
import removeThisYear from './removeThisYear.vue';
import doArchive from './doArchive.vue';
import timeline from './timeline.vue';
export default {
	components: {
		reSequence, removeStale, removeThisYear, doArchive, timeline
	}
};
</script>


