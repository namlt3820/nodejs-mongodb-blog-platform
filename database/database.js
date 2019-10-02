const mongoose = require('mongoose');

const connectDatabase = async () => {
	try {
		let uri = 'mongodb://namlt:123456@localhost:27018/fullstackNodejs2018';
		await mongoose.connect(uri, {
			connectTimeoutMS: 10000,
			useNewUrlParser: true,
			useCreateIndex: true
		});
		console.log(`Connect Mongo Database Successfully`);
	} catch (error) {
		console.log(`Cannot connect to database. Error: ${error}`);
	}
};

connectDatabase();

module.exports = {
	mongoose
};
