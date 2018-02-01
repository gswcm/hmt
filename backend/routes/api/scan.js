const express = require("express");
const errToJSON = require("error-to-json");
const router = express.Router();
const Scan = require("../../lib/models/scan");
const evalCredentials = require("../../lib/utils").evalCredentials;

router.post("/scan/get", (req, res) => {
	let credentials = req.body.credentials;
	evalCredentials(credentials)
	.then(() => {
		return Scan.find();
	})
	.then(scans => {
		return res.json({ 
			status: 0,
			scans: scans.map(i => i.data)
		});
	})
	.catch(error => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.post("/scan/set", (req, res) => {
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
				//-- Find inner (or semi-) collisions of submitted scan records without consulting DB
				let dups = {};
				let keys = [];
				let redo = [];
				return result.OK
				.filter(
					i => {
						let key = i.substr(0,4);
						if(keys.indexOf(key) > -1) {
							if(!dups[key]) {
								dups[key] = {
									db: '',
									scan: []
								};
							}
							dups[key].scan.push(i);
							redo.push(i);
							return false;
						}
						else {
							keys.push(key);
							return true;
						}
					}
				)
				.reduce(
					(a,i) => {
						return Scan.findById(i.substr(0,4))
						.then((doc) => a
							.then(result => {
								if(doc) {
									if(!result.duplicates[doc._id]) {
										result.duplicates[doc._id] = {											
											scan: []
										};
									}	
									result.duplicates[doc._id].db = doc.data,
									result.duplicates[doc._id].scan.push(i);
									result.redo.push(i);
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
						redo: redo,
						duplicates: dups,
						invalid: result.invalid
					})
				);
			})
			.then(result => {
				return Promise.all(result.OK.map(i => new Scan({ data: i }).save()))
				.then(() => {
					if(force) {
						return Promise.all(result.redo.sort().map(i => {
							return Scan.findByIdAndUpdate(i.substr(0,4),{ $set: {data: i} });
						}))
						.then(() => {
							result.OK = result.OK.concat(result.redo);
							result.redo = [];
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