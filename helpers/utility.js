const nodemailer = require('nodemailer');
const PORT = 3000;

const sendEmail = async (receiverEmail, secretKey) => {
	let testAccount = await nodemailer.createTestAccount();
	try {
		let transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: testAccount.user, // generated ethereal user
				pass: testAccount.pass // generated ethereal password
			}
		});

		let mailOptions = {
			from: '"Techmaster" <namlt3820@gmail.com>',
			to: receiverEmail,
			subject: 'Activate Email',
			html: `<h1>Please click here to activate your account:</h1> http://${require('os').hostname()}:${PORT}/users/activateUser?secretKey=${secretKey}&email=${receiverEmail}`
		};

		let info = await transporter.sendMail(mailOptions);
		console.log('Message sent: %s', info.messageId);
		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

		// Preview only available when sending through an Ethereal account
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
	} catch (error) {
		throw error;
	}
};

module.exports = { sendEmail, PORT };
