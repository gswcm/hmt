//-- Modules
const mongoose = require('mongoose');
//-- Models
const Counter = require('../models/counter');
//-- Utils
const sprintf = require('sprintf-js').sprintf;
const capitalize = require('../utils').capitalize;
//-- Schemas
const recordSchema = require('./record');

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
		default: Date.now
	},
	paid: {
		type: Boolean,
		required: true,
		default: false
	},
	seq: {
		type: String,
		default: null
	}
})
.pre("save", function(next) {
	this.updated = new Date();
	next();
})
.pre("save", function(next){
	for(let key of ['main','temp']) {
		if(this[key] && this[key].school.name) {
			this[key].school.name = capitalize(this[key].school.name);
			this[key].team.names = this[key].team.names.map((name) => {
				return capitalize(name.replace(/\s+/g,' '));
			});
		}
	}
	next();
})
.pre("save", function(next) {
	let doc = this;
	if(doc.seq === null) {
		Counter.findByIdAndUpdate(
			{ _id: 'regSeq' },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		)
		.exec()
		.then(function(count) {
			doc.seq = sprintf("%02d", count.seq);
			next();
		})
		.catch(function(error) {
			console.error("counter error-> : " + error);
			throw error;
		});
	}
	else {
		next();
	}
})
.index({
	email: 1
});

module.exports = registrationSchema;
