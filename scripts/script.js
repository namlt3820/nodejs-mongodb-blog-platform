const { mongoose } = require('../database/database');
const { User } = require('../database/models/User');
const setUserToBeAdmin = async userId => {
	try {
		let user = await User.findById(userId);
		if (!user) {
			console.log(`Cannot find user with id ${userId}`);
		}

		user.permission = 2;
		user.isBanned = 0;
		user.active = 1;

		await user.save();
		console.log(`Set user status to admin successfully`);
	} catch (error) {
		console.log(`Cannot set userId ${userId} to become admin: ${error}`);
	}
};

setUserToBeAdmin('5d7f3fd08902c50b2fda254d');
