const express = require("express");
const errToJSON = require("error-to-json");
const router = express.Router();
const Account = require("../../lib/models/account");
const Timeline = require("../../lib/models/timeline");
const Q = require("../../lib/models/q");
const Scan = require("../../lib/models/scan");
const Counter = require("../../lib/models/counter");
const Archive = require("../../lib/models/archive");
const Registration = require("../../lib/models/registration");
const Ciphering = require("../../lib/models/ciphering");
const evalCredentials = require("../../lib/utils").evalCredentials;
const getRawRQSC = require("../../lib/rqsc").getRawRQSC;


router.post("/mtn/timeline", (req,res) => {
	let credentials = req.body.credentials;
	let eventDate = req.body.eventDate;
	let update = req.body.update;
	(update ? evalCredentials(credentials) : Promise.resolve())
	.then(() => {
		return Timeline.findOne()
		.then(timeline => {
			if(!timeline) {
				timeline = new Timeline();
			}
			if(update) {
				timeline.eventDate = eventDate;
			}
			return timeline.save();
		});
	})
	.then(timeline => {
		return res.json({ 
			timeline,
			status: 0,
		});
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

router.post("/mtn/archive", (req,res) => {
	let credentials = req.body.credentials;
	let year = req.body.year;
	if(!/^\d{4}$/.test(year)) {
		return res.json({ 
			status: 400, 
			error: errToJSON(new Error('Year parameter has to be in 4-digits format')) 
		});
	}
	evalCredentials(credentials)
	.then(() => {
		return getRawRQSC();
	})
	.then(rqsc => {
		return Archive.findOneAndUpdate({year}, {	year, ...rqsc }, { upsert: true });
	})
	.then((rqsc) => {
		return res.json({ 
			rqsc,
			status: 0,
		});
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

router.post("/mtn/removeThisYear", (req,res) => {
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return Account.deleteMany({admin:false});
	})
	.then(() => {
		return Registration.deleteMany();
	})
	.then(() => {
		return Q.deleteMany();
	})
	.then(() => {
		let q = new Q();
		q.questions = Array.apply(null, Array(40)).map(() => ({
			cat: null,
			key: null
		}));
		return q.save();
	})
	.then(() => {
		return Scan.deleteMany();
	})
	.then(() => {
		return Counter.deleteMany();
	})
	.then(() => {
		return Ciphering.deleteMany();
	})
	.then(() => {
		res.json({
			status: 0
		});
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

router.post("/mtn/removeStale", (req,res) => {
	let credentials = req.body.credentials;
	let stat = {};
	evalCredentials(credentials)
	//-- Delete registrations with empty "temp" and "main"
	.then(() => {
		return Registration.find({temp: {$eq: null}, main: {$eq: null}});
	})
	//-- Delete accounts having no matched registrations
	.then((records) => {
		return Promise.all(records.map(record => record.remove()));
	})
	.then((records) => {
		stat.regs = records.length;
		return Account.find({admin:false}).exec();
	})
	.then((accounts) => {
		return Promise.all(accounts.map(a => {
			return Registration.find({email:a.email}).exec()
			.then(records => {
				return records.length === 0 ? a.remove() : Promise.resolve(null);
			});
		}));
	})
	.then((accounts) => {
		stat.accs = accounts.filter(a => a !== null).length;
		res.json({
			status: 0,
			stat
		});
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

router.post("/mtn/reseq", (req,res) => {
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return Counter.findByIdAndUpdate({ _id: 'regSeq' }, { $set: { seq: -1 } }, { upsert: true });
	})
	.then(() => {
		return Registration.find().sort({email:1}).exec();
	})
	.then(records => {
		return records.reduce((promise,record) => promise.then(() => {
			record.seq = null;
			return record.save();
		}), Promise.resolve());
	})
	.then(() => {
		res.json({
			status: 0,
		});
	})
	.catch(error => {
		res.json({ status: 500, error: errToJSON(error) });
	});
});

module.exports = router;
