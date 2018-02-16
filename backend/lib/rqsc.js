const Q = require("./models/q");
const S = require("./models/scan");
const R = require("./models/registration");
const C = require("./models/ciphering");
const Archive = require("./models/archive");
const _ = require("lodash");

module.exports = {
	getRawRQSC(year) {
		if(year) {
			return Archive.findOne({year},{r:1,q:1,s:1,c:1});
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
			})
			.then(rqs => {
				return C.find({})
				.then(c => {
					return Promise.resolve({c,...rqs});	
				});
			});
		}
	},
	getRQSC: (year) => {
		return module.exports.getRawRQSC(year)
		.then(rqsc => {
			if(!rqsc) {
				return Promise.reject(new Error(`Archive for ${year} year not found`));
			}
			let r = {};
			for(let i of rqsc.r) {
				r[i.seq] = { ..._.pick(i.main,['team','school','sponsor']), seq:i.seq, email:i.email };
			}
			return Promise.resolve({
				R: r,
				Q: rqsc.q[0].questions.map(i => _.pick(i,['cat','key'])),
				S: rqsc.s.map(i => i.data),
				C: rqsc.c.map(i => _.pick(i, ['division', 'school', 'value']))
			});
		});
	}
};