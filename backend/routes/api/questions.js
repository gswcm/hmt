const express = require("express");
const errToJSON = require("error-to-json");
const router = express.Router();
const Q = require("../../lib/models/q");
const evalCredentials = require("../../lib/utils").evalCredentials;

router.post("/Q", (req, res) => {
	let credentials = req.body.credentials;
	let questions = req.body.questions;
	evalCredentials(credentials)
	.then(() => {
		return Q.findOne().exec();
	})
	.then((q) => {
		if(!q) {
			q = new Q();
		}
		if(!q.questions || !q.questions.length) {
			q.questions = Array.apply(null, Array(40)).map(() => ({
				cat: null,
				key: null
			}));
		}
		if(questions && questions.length) {
			q.questions = questions;
		}
		return q.save();
	})
	.then(q => {
		return res.json({ 
			questions: q.questions,
			status: 0 
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