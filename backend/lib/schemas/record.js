const mongoose = require('mongoose');
const tshirtSchema = require('./tshirt');

const recordSchema = mongoose.Schema({
	sponsor: {
		name: {
			type: String,
			default: ""
		},
		phone: {
			type: String,
			default: ""
		}
	},
	school: {
		name: {
			type: String,
			default: ""
		},
		division: {
			type: String,
			default: null
		}
	},
	team: {
		names: [String],
		meals: {
			type: Number,
			default: 0
		},
		tshirts: [tshirtSchema]
	}
});

module.exports = recordSchema;