const mongoose = require('mongoose');
const scan = require('./scan');
const q = require('./q');
const registration = require('./registration');
const ciphering = require('./ciphering');

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
		type: [registration],
		default: []
	},
	//-- Cipherings
	c: {
		type: [ciphering],
		default: []
	}
})
.index({
	year: 1
});

module.exports = archiveSchema;