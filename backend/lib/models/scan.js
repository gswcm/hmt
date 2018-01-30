const mongoose = require('mongoose');

const scanSchema = mongoose.Schema({
	_id: {
		type: String,
	},
	data: {
		type: String,
		required: true,
		default: ''
	}
})
.pre('save', function(next){
	let doc = this;
	if(doc.data.length > 4) {
		doc._id = doc.data.substr(0,4);
	}
	else {
		console.log('Incorrect record: ', doc);
	}
	next();
});

module.exports = mongoose.model('scan', scanSchema);