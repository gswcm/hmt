const mongoose = require('mongoose');

const timelineSchema = mongoose.Schema({
	year: {
		type: String,
		default: '20xx'
	},
	deadlines: {
		makeNew: {
			type: Date,
			default: null
		},
		updateExisting: {
			type: Date,
			default: null
		},
		payment: {
			type: Date,
			default: null
		},
		releaseResults: {
			type: Date,
			default: null
		}
	}
})
.index({
	year: 1
}); 

module.exports = timelineSchema;
