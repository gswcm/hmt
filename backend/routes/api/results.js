const express = require("express");
const errToJSON = require("error-to-json");
const rqsc = require("../../lib/rqsc");
const Archive = require("../../lib/models/archive");
const Ciphering = require("../../lib/models/ciphering");
const router = express.Router();

router.post("/results/ciphering", (req, res) => {
	let division = req.body.division;
	let school = req.body.school;
	let value = req.body.value;
	Ciphering.findOne({division,school})
	.then(ciphering => {
		if(!ciphering) {
			ciphering = new Ciphering({division,school});
		}
		if(typeof value === 'number' && value >= 0) {
			ciphering.value = value;
		}
		return ciphering.save();
	})
	.then(ciphering => {
		return res.json({ 
			ciphering,
			status: 0,
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post("/results/years", (req, res) => {
	Archive.find({},{year:1})
	.then(archives => {
		return res.json({ 
			status: 0,
			archives
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post("/results/get", (req, res) => {
	let year = req.body.year;
	rqsc.getRQSC(year)
	.then(rqsc => {
		return res.json({ 
			status: 0,
			rqsc
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