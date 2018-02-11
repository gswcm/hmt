const Q = require("./models/q");
const S = require("./models/scan");
const R = require("./models/registration");
const Archive = require("./models/archive");
const _ = require("lodash");

module.exports = {
	getRawRQS(year) {
		if(year) {
			return Archive.findOne({year},{r:1,q:1,s:1});
		}
		else {
			return R.find({main: {$ne:null}})
			.then(r => {
				return Q.find({})
				.then(q => {
					return Promise.resolve({r,q});
				});
			})
			.then(rq => {
				return S.find({})
				.then(s => {
					let r = rq.r.map(e => _.pick(e, ['email', 'seq', 'main']));
					let q = rq.q;
					return Promise.resolve({r,q,s});
				});
			});
		}
	},
	getRQS: (year) => {
		return module.exports.getRawRQS(year)
		.then(rqs => {
			if(!rqs) {
				return Promise.reject(new Error(`Archive for ${year} year not found`));
			}
			console.log(rqs);
			let r = {};
			for(let i of rqs.r) {
				r[i.seq] = { ..._.pick(i.main,['team','school','sponsor']), seq:i.seq, email:i.email };
			}
			return Promise.resolve({
				R: r,
				Q: rqs.q[0].questions.map(i => _.pick(i,['cat','key'])),
				S: rqs.s.map(i => i.data)
			});
		});
	}
};