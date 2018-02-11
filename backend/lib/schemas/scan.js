const mongoose = require('mongoose');

const scanSchema = mongoose.Schema({
	_id: {
		type: String,
	},
	data: {
		type: String,
		required: true,
		validate: value => /^\d{4}[0-9A-E]{40}[0]{5}$/.test(value)
	}
})
.pre('save', function(next){
	this._id = this.data.substr(0,4);
	next();
});

module.exports = scanSchema;