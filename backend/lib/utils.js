const Account = require("./models/account");

module.exports = {
	evalCredentials: credentials => {
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
	}
};