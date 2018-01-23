const mongoose = require('mongoose');

const qSchema = mongoose.Schema({
	questions: [{
		cat: {
			type: String,
			enum: ['ALGE','ANGE','GEOM','TRIG','MISC', null],
			default: null
		},
		key: {
			type: Number,
			min: 1,
			max: 5,
			default: null
		}
	}]
});

module.exports = mongoose.model('Q', qSchema);