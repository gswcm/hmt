const express = require("express");
const errToJSON = require("error-to-json");
const router = express.Router();
const Account = require("../../lib/models/account");
const Registration = require("../../lib/models/registration");
const Counter = require("../../lib/models/counter");

let evalCredentials = credentials => {
	let email = credentials.email;
	let password = credentials.password;
	return Account.findOne({ email })
	.then(account => {
		if (account) {
			return account.checkPassword(password)
			.then(result => {
				return result
					? Promise.resolve(account)
					: Promise.reject(new Error("Incorrect credentials"));
			});
		} 
		else {
			return Promise.reject(new Error("Incorrect credentials"));
		}
	})
	.then(account => {
		if (!account.admin) {
			return Promise.reject(new Error("User is not an admin"));
		}
		return Promise.resolve();
	});
};

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
		// return Promise.all(records.map(p => p.save()));
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
