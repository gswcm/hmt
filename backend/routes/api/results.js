const express = require("express");
const errToJSON = require("error-to-json");
const _ = require("lodash");
const router = express.Router();
const Q = require("../../lib/models/q");
const S = require("../../lib/models/scan");
const R = require("../../lib/models/registration");


router.post("/results/get", (req, res) => {
	R.find({main: {$ne:null}},{email:1,main:1,seq:1})
	.then(r => {
		return Q.findOne({},{questions:1})
		.then(q => {
			return Promise.resolve({r,q});
		});
	})
	.then(rq => {
		return S.find({},{data:1})
		.then(s => {
			let r = {};
			for(let i of rq.r) {
				r[i.seq] = { ..._.pick(i.main,['team','school','sponsor']), seq:i.seq, email:i.email };
			}
			return Promise.resolve({
				r: r,
				q: rq.q.questions.map(i => _.pick(i,['cat','key'])),
				s: s.map(i => i.data)
			});
		});
	}) 
	.then(rqs => {
		return res.json({ 
			status: 0,
			rqs
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

module.exports = router;