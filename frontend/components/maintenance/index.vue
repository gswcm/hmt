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
import doArchive from './doArchive.vue';
import timeline from './timeline.vue';
export default {
	components: {
		reSequence, removeStale, doArchive, timeline
	}
};
</script>


