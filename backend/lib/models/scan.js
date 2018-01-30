const mongoose = require('mongoose');

const scanSchema = mongoose.Schema({
	_id: {
		type: String,
	},
	data: {
		type: String,
		required: true,
		validate: [ value => /^\d{4}/.test(value) && value.length === 49, 'Bad value {VALUE}']
	}
})
.pre('save', function(next){
	this._id = this.data.substr(0,4);
	next();
});

module.exports = mongoose.model('scan', scanSchema);