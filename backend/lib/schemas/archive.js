const mongoose = require('mongoose');
const scan = require('./scan');
const q = require('./q');
const record = require('./record');

const archiveSchema = mongoose.Schema({
	year: {
		type: String,
		required: true
	},
	//-- Scantron records
	s: {
		type: [scan],
		default: []
	},
	//-- Questions
	q: {
		type: [q],
		default: []
	},
	//-- Registrations
	r: {
		type: [record],
		default: []
	}
})
.index({
	year: 1
});

module.exports = archiveSchema;