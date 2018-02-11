const express = require("express");
const errToJSON = require("error-to-json");
const rqs = require("../../lib/rqs");
const Archive = require("../../lib/models/archive");
const router = express.Router();

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
	rqs.getRQS(year)
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