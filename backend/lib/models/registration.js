const Counter = require('./counter');
const mongoose = require('mongoose');
const sprintf = require('sprintf-js').sprintf;

function capitalize(s) {
	return s.trim().toLowerCase().split(/\s+/g).map(i => {
		return i[0].toUpperCase() + i.substr(1);
	}).join(' ');
}

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
			default: ""
		},
		phone: {
			type: String,
			default: ""
		}
	},
	school: {
		name: {
			type: String,
			default: ""
		},
		division: {
			type: String,
			default: null
		}
	},
	team: {
		names: [String],
		meals: {
			type: Number,
			default: 0
		},
		tshirts: [tshirtSchema]
	}
});

const registrationSchema = mongoose
	.Schema({
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

module.exports = mongoose.model("Registration", registrationSchema);
