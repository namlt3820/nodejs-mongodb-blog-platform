const { mongoose } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
const { sendEmail } = require('../../helpers/utility');
const { deleteBlogPostByAuthor } = require('./BlogPost');

const SECRET_STRING = 'secret string';
const ACTION_BLOCK_USER = 'ACTION_BLOCK_USER';
const ACTION_DELETE_USER = 'ACTION_DELETE_USER';
const UserSchema = new Schema({
	name: {
		type: String,
		default: 'unknown',
		unique: true
	},
	email: {
		type: String,
		match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	active: {
		type: Number,
		default: 0
	},
	blogPosts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'BlogPost'
		}
	],
	permission: {
		type: Number,
		default: 0
	},
	isBanned: {
		type: Number,
		default: 0
	}
});

const User = mongoose.model('User', UserSchema);

const insertUser = async (name, email, password) => {
	try {
		const encryptedPassword = await bcrypt.hash(password, 10);
		const newUser = new User();
		newUser.name = name;
		newUser.email = email;
		newUser.password = encryptedPassword;
		await newUser.save();
		await sendEmail(email, encryptedPassword);
	} catch (error) {
		console.log(`Cannot insert new user. Error: ${error}`);
		throw error;
	}
};

const activateUser = async (email, secretKey) => {
	try {
		let foundUser = await User.findOne({ email, password: secretKey }).exec();

		if (!foundUser) {
			throw 'Không tìm thấy user để kích hoạt';
		}

		if (foundUser.isBanned === 1) {
			throw 'User đã bị khoá tài khoản, do vi phạm điều khoản';
		}

		if (foundUser.active === 0) {
			foundUser.active = 1;
			await foundUser.save();
		} else {
			throw 'User đã được kích hoạt';
		}
	} catch (error) {
		throw error;
	}
};

const loginUser = async (email, password) => {
	try {
		let foundUser = await User.findOne({ email: email.trim() }).exec();

		if (!foundUser) {
			throw 'User không tồn tại';
		}

		if (foundUser.isBanned === 1) {
			throw 'User đã bị khoá tài khoản, do vi phạm điều khoản';
		}

		if (foundUser.active === 0) {
			throw 'User chưa kích hoạt, kiểm tra hòm mail';
		}

		let encryptedPassword = foundUser.password;
		let checkPassword = await bcrypt.compare(password, encryptedPassword);
		if (checkPassword) {
			let jsonObject = {
				id: foundUser._id
			};
			let tokenKey = await jwt.sign(jsonObject, SECRET_STRING, { expiresIn: 86400 });
			return tokenKey;
		}
	} catch (error) {
		throw error;
	}
};

const verifyJWT = async tokenKey => {
	try {
		let decodedJson = await jwt.verify(tokenKey, SECRET_STRING);

		if (Date.now() / 1000 > decodedJson.exp) {
			throw 'Token expired, please login again';
		}

		let foundUser = await User.findById(decodedJson.id);

		if (foundUser.isBanned === 1) {
			throw 'User đã bị khoá tài khoản, do vi phạm điều khoản';
		}

		if (!foundUser) {
			throw 'Cannot find user with this id';
		}
		return foundUser;
	} catch (error) {
		throw error;
	}
};

const blockOrDeleteUser = async (userIds, tokenKey, actionTypes) => {
	try {
		let signedInUser = await verifyJWT(tokenKey);
		if (signedInUser.permission !== 2) {
			throw 'Only admin user has enough rights';
		}
		userIds.forEach(async userId => {
			let user = await User.findById(userId);
			if (!user) {
				return;
			}
			if (actionTypes === ACTION_BLOCK_USER) {
				user.isBanned = 1;
				await user.save();
			} else if (actionTypes === ACTION_DELETE_USER) {
				await deleteBlogPostByAuthor(userId);
				await User.findByIdAndDelete(userId);
			}
		});
	} catch (error) {
		throw error;
	}
};

module.exports = { User, insertUser, activateUser, loginUser, verifyJWT, blockOrDeleteUser };
