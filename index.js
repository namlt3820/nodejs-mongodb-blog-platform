const express = require('express');
const app = express();
const { PORT } = require('./helpers/utility');
const bodyParser = require('body-parser');
const userRouter = require('./database/routers/userRouter');
const blogPostRouter = require('./database/routers/blogPostRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', userRouter);
app.use('/blogposts', blogPostRouter);

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
