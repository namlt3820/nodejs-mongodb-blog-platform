const { mongoose } = require('../database');
const { Schema } = mongoose;
const { verifyJWT } = require('./User');

const BlogPostSchema = new Schema({
	title: {
		type: String,
		default: 'haha',
		unique: true
	},
	content: {
		type: String,
		default: ''
	},
	date: {
		type: Date,
		default: Date.now()
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

const insertBlogPost = async (title, content, tokenKey) => {
	try {
		let signedInUser = await verifyJWT(tokenKey);

		let newBlogPost = await BlogPost.create({
			title,
			content,
			date: Date.now(),
			author: signedInUser
		});

		await newBlogPost.save();
		signedInUser.blogPosts.push(newBlogPost);
		await signedInUser.save();
		return newBlogPost;
	} catch (error) {
		throw error;
	}
};

const queryBlogPosts = async text => {
	try {
		let blogPosts = await BlogPost.find({
			$or: [
				{
					title: new RegExp(text, 'i')
				},
				{
					content: new RegExp(text, 'i')
				}
			]
		});
		return blogPosts;
	} catch (error) {
		throw error;
	}
};

const queryBlogPostsByDateRange = async (from, to) => {
	let fromDate = new Date(
		parseInt(from.split('-')[2]),
		parseInt(from.split('-')[1]) - 1,
		parseInt(from.split('-')[0])
	);

	let toDate = new Date(
		parseInt(to.split('-')[2]),
		parseInt(to.split('-')[1]) - 1,
		parseInt(to.split('-')[0])
	);

	try {
		let blogPosts = await BlogPost.find({
			date: {
				$gte: fromDate,
				$lte: toDate
			}
		});
		return blogPosts;
	} catch (error) {
		throw error;
	}
};

const getDetailBlogPost = async blogId => {
	try {
		const foundBlogPost = await BlogPost.findById(blogId);
		if (!foundBlogPost) {
			throw `Cannot find blog post with id ${blogId}`;
		}
		return foundBlogPost;
	} catch (error) {
		throw error;
	}
};

const updateBlogPost = async (blogId, updatedBlogPost, tokenKey) => {
	try {
		let signedUser = await verifyJWT(tokenKey);
		let blogPost = await BlogPost.findById(blogId);

		if (!blogPost) {
			throw `Cannot find blog post with id ${blogId}`;
		}

		if (signedUser.id.toString() !== blogPost.author.toString()) {
			throw `Cannot update because you're not the post's author`;
		}

		blogPost.title = updatedBlogPost.title ? updatedBlogPost.title : blogPost.title;
		blogPost.content = updatedBlogPost.content ? updatedBlogPost.content : blogPost.content;
		blogPost.date = Date.now();
		await blogPost.save();

		return blogPost;
	} catch (error) {
		throw error;
	}
};

const deleteBlogPost = async (blogId, tokenKey) => {
	try {
		let signedUser = await verifyJWT(tokenKey);
		let blogPost = await BlogPost.findById(blogId);

		if (!blogPost) {
			throw `Cannot find blog post with id ${blogId}`;
		}

		if (signedUser.id.toString() !== blogPost.author.toString()) {
			throw `Cannot delete because you're not the post's author`;
		}

		await BlogPost.deleteOne({ _id: blogId });
		signedUser.blogPosts = await signedUser.blogPosts.filter(
			eachBlogPost => eachBlogPost._id.toString() !== blogPost._id.toString()
		);
		await signedUser.save();
	} catch (error) {
		throw error;
	}
};

const deleteBlogPostByAuthor = async authorId => {
	try {
		await BlogPost.deleteMany({ author: authorId });
	} catch (error) {
		throw error;
	}
};

module.exports = {
	BlogPost,
	insertBlogPost,
	queryBlogPosts,
	queryBlogPostsByDateRange,
	getDetailBlogPost,
	updateBlogPost,
	deleteBlogPost,
	deleteBlogPostByAuthor
};
