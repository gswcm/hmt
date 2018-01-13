const express = require('express');
const errToJSON = require('error-to-json');
const router = express.Router();
const Registration = require('../../lib/models/registration');
const Account = require('../../lib/models/account');

let getSummary = (registrations) => {
	let tShirts = {};
	registrations.filter((i) => i.main.team.tshirts.length > 0).forEach(i => {
		i.main.team.tshirts.forEach(t => {
			tShirts[t.size] = ((t.size in tShirts) ? tShirts[t.size] : 0) + t.qty;
		});
	});
	let summary = {
		numTeams: registrations.length,
		numStudents: registrations.reduce((a,i) => a + i.main.team.names.length, 0),
		numMeals: registrations.reduce((a,i) => a + i.main.team.meals, 0),
		tshirts: Object.keys(tShirts).length ? tShirts : null
	};
	return summary;
};

router.post('/statistics', (req, res) => {
	Account.find({admin:false})
	.then(accounts => {
		let emails = accounts.map(i => i.email);
		return Registration.find(
			{
				$and: [{ email: emails }, { 'main': { $ne: null } }]
			}
		);
	})
	.then((registrations) => {
		return res.json({
			status: 0,
			summary: getSummary(registrations)
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: errToJSON(error)
		});
	});
});

router.get('/statistics', (req, res) => {
	Account.find({admin:false})
	.then(accounts => {
		let emails = accounts.map(i => i.email);
		return Registration.find(
			{
				$and: [{ email: emails }, { 'main': { $ne: null } }]
			}
		);
	})
	.then((registrations) => {		
		return res.render('statistics', {
			status: 0,
			summary: getSummary(registrations)
		});
	})
	.catch((error) => {
		res.json({
			status: 500,
			error: error.message
		});
	});
});

module.exports = router;

