const express = require("express");
const errToJSON = require("error-to-json");
const router = express.Router();
const Scan = require("../../lib/models/scan");
const evalCredentials = require("../../lib/utils").evalCredentials;

router.post("/scan", (req, res) => {
	let credentials = req.body.credentials;
	let evalData = req.body.evalData;
	let force = req.body.force;
	evalCredentials(credentials)
	.then(() => {
		if(evalData && evalData.length) {
			//-- Evaluate submitted scan data
			return evalData.reduce(
				(a,i) => {
					return new Scan({ data: i }).validate()
					.then(() => {
						return a.then(result => {
							result.OK.push(i);	
							return Promise.resolve(result);
						});
					})
					.catch(() => {
						return a.then(result => {
							result.invalid.push(i);
							return Promise.resolve(result);
						});
					});
				}, 
				Promise.resolve({
					OK: [],
					invalid: []
				})
			)
			.then(result => {
				//-- Check valid data records for collision with existing (in DB) ones
				return result.OK.reduce(
					(a,i) => {
						return Scan.findById(i.substr(0,4))
						.then((doc) => a
							.then(result => {
								if(doc) {
									result.duplicates[doc._id] = {
										old: doc.data,
										new: i,
										same: i === doc.data
									};
								}
								else {
									result.OK.push(i);
								}
								return Promise.resolve(result);
							})
						);
					}, 
					Promise.resolve({
						OK: [],
						duplicates: {},
						invalid: result.invalid
					})
				);
			})
			.then(result => {
				return Promise.all(result.OK.map(i => new Scan({ data: i }).save()))
				.then(() => {
					if(force) {
						let dups = result.duplicates;
						return Promise.all(Object.keys(dups).map(i => Scan.findByIdAndUpdate(i,{$set:{data:dups[i].new}})))
						.then(() => {
							result.OK = result.OK.concat(Object.keys(dups).map(i => dups[i].new));
							result.duplicates = {};
							return Promise.resolve(result); 	 
						});
					}
					else {
						return Promise.resolve(result); 	
					}
				});
			});
		}
		else {
			//-- Remove existing records
			return Scan.remove().then(() => Promise.resolve({}));
		}
	})
	.then(result => {
		return res.json({ 
			status: 0,
			result
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