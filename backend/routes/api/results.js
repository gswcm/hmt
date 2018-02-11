const express = require("express");
const errToJSON = require("error-to-json");
const rqs = require("../../lib/rqs");
const router = express.Router();

router.post("/results/get", (req, res) => {
	rqs.getRQS()
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