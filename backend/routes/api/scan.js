const express = require("express");
const errToJSON = require("error-to-json");
const router = express.Router();
const Scan = require("../../lib/models/scan");
const evalCredentials = require("../../lib/utils").evalCredentials;

router.post("/scan", (req, res) => {
	let credentials = req.body.credentials;
	let evalData = req.body.evalData;
	evalCredentials(credentials)
	.then(() => {
		if(evalData && evalData.length) {
			//-- Merge existing records with submitted ones
			return Promise.all(evalData.map(i => new Scan({	data: i, _id: '' }).save()));
		}
		else {
			//-- Remove existing records
			return Scan.remove();
		}
	})
	.then(() => {
		return res.json({ 
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