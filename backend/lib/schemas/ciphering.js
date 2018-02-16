const mongoose = require('mongoose');

const cipheringSchema = mongoose.Schema({
	division: String,
	school: String,
	value: {
		type: Number,
		default: 0
	}
})
.index({
	division: 1,
	school: 1
});

module.exports = cipheringSchema;