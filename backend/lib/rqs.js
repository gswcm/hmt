const Q = require("./models/q");
const S = require("./models/scan");
const R = require("./models/registration");
const _ = require("lodash");

module.exports = {
	getRawRQS() {
		return R.find({main: {$ne:null}})
		.then(r => {
			return Q.findOne({})
			.then(q => {
				return Promise.resolve({r,q});
			});
		})
		.then(rq => {
			return S.find({})
			.then(s => {
				let r = rq.r;
				let q = rq.q;
				return Promise.resolve({r,q,s});
			});
		});
	},
	getRQS: () => {
		return module.exports.getRawRQS()
		.then(rqs => {
			let r = {};
			for(let i of rqs.r) {
				r[i.seq] = { ..._.pick(i.main,['team','school','sponsor']), seq:i.seq, email:i.email };
			}
			return Promise.resolve({
				R: r,
				Q: rqs.q.questions.map(i => _.pick(i,['cat','key'])),
				S: rqs.s.map(i => i.data)
			});
		});
	}
};