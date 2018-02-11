const mongoose = require('mongoose');

const tshirtSchema = mongoose.Schema({
	size: {
		type: String,
		default: null
	},
	qty: {
		type: Number,
		default: 0
	}
});

module.exports = tshirtSchema;