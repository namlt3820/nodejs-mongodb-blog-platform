const express = require('express');
const router = express.Router();
const {
	insertUser,
	activateUser,
	loginUser,
	verifyJWT,
	blockOrDeleteUser
} = require('../models/User');

router.use((req, res, next) => {
	console.log('Time: ', Date.now());
	next();
});

router.post('/registerUser', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	let { name, email, password } = req.body;
	try {
		await insertUser(name, email, password);
		res.json({
			result: 'ok',
			message: 'Bạn đăng ký thành công.'
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Có lỗi trong quá trình đăng ký. ${
				error.code === 11000 ? 'Tên hoặc email đã tồn tại' : error
			}`
		});
	}
});

router.get('/activateUser', async (req, res) => {
	let { email, secretKey } = req.query;
	try {
		await activateUser(email, secretKey);
		res.send('<h1 style="color:MediumSeaGreen">Kích hoạt user thành công</h1>');
	} catch (error) {
		res.send(`<h1 style="color:red">Kích hoạt user không thành công: ${error}</h1>`);
	}
});

router.post('/loginUser', async (req, res) => {
	let { email, password } = req.body;
	try {
		let tokenKey = await loginUser(email, password);
		res.json({
			result: 'ok',
			message: 'Login user successfully',
			tokenKey
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Có lỗi trong quá trình đăng nhập: ${error}`
		});
	}
});

router.get('/jwtTest', async (req, res) => {
	let tokenKey = req.headers['x-access-token'];
	try {
		await verifyJWT(tokenKey);
		res.json({
			result: 'ok',
			message: 'Verify json web token successfully'
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Error: ${error}`
		});
	}
});

router.post('/admin/blogordeleteusers', async (req, res) => {
	let tokenKey = req.headers['x-access-token'];
	let { userIds, actionType } = req.body;
	userIds = userIds.split(',');
	try {
		await blockOrDeleteUser(userIds, tokenKey, actionType);
		res.json({
			result: 'ok',
			message: 'Block/Delete user successfully'
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: 'you suck!'
		});
	}
});
module.exports = router;
