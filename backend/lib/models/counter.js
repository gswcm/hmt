const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
	_id: { 
		type: String, 
		required: true 
	},
	seq: Number
});

module.exports = mongoose.model("Counter", counterSchema);