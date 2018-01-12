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

const recordSchema = mongoose.Schema({
	sponsor: {
		name: {
			type: String,
			default: ''
		},		
		phone: {
			type: String,
			default: ''
		},
	},
	school: {
		name: {
			type: String,
			default: ''
		},
		division: {
			type: String,
			default: null
		},
	},
	team: {
		names: [String],
		meals: {
			type: Number,
			default: 0
		},
		tshirts: [tshirtSchema]
	},
});

const registrationSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	main: {
		type: recordSchema,
		default: null
	},
	temp: {
		type: recordSchema,
		default: null
	},
	updated: {
		type: Date,
		default: Date.now,
	},
	paid: {
		type: Boolean,
		required: true,
		default: false
	}
})
.pre('save', function(next) {
	this.updated = new Date();
	next();
})
.index({
	email: 1
});


module.exports = mongoose.model('Registration', registrationSchema);
