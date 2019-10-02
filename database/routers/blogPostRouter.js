const express = require('express');
const router = express.Router();
const {
	insertBlogPost,
	queryBlogPosts,
	queryBlogPostsByDateRange,
	getDetailBlogPost,
	updateBlogPost,
	deleteBlogPost
} = require('../models/BlogPost');

router.use((req, res, next) => {
	console.log('Time: ', Date.now());
	next();
});

router.post('/insertBlogpost', async (req, res) => {
	let { title, content } = req.body;
	let tokenKey = req.headers['x-access-token'];
	try {
		const newBlogPost = await insertBlogPost(title, content, tokenKey);
		res.json({
			result: 'ok',
			message: 'New blog post added successfully',
			data: newBlogPost
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Cannot add new blog post: ${error}`
		});
	}
});

router.get('/queryBlogPosts', async (req, res) => {
	let { text } = req.query;
	try {
		let blogPosts = await queryBlogPosts(text);
		res.json({
			result: 'ok',
			message: 'query blog posts successfully',
			data: blogPosts
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Cannot not query blog posts: ${error}`
		});
	}
});

router.get('/queryBlogPostsByDateRange', async (req, res) => {
	let { from, to } = req.query;
	try {
		let blogPosts = await queryBlogPostsByDateRange(from, to);
		res.json({
			result: 'ok',
			message: 'query blog posts successfully',
			data: blogPosts
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Cannot query blog posts: ${error}`
		});
	}
});

router.get('/detailBlogPost', async (req, res) => {
	try {
		const { blogId } = req.query;
		const foundBlogPost = await getDetailBlogPost(blogId);
		res.json({
			result: 'ok',
			message: 'query blog post detail successfully',
			data: foundBlogPost
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Cannot get blog post detail: ${error}`
		});
	}
});

router.put('/updateBlogpost', async (req, res) => {
	let { id } = req.body;
	let updatedBlogpost = req.body;
	let tokenKey = req.headers['x-access-token'];

	try {
		let blogPost = await updateBlogPost(id, updatedBlogpost, tokenKey);
		res.json({
			result: 'ok',
			message: 'update blog post successfully',
			data: blogPost
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Cannot update blog post with id ${id}`
		});
	}
});

router.delete('/deleteBlogPost', async (req, res) => {
	let { id } = req.body;
	let tokenKey = req.headers['x-access-token'];
	try {
		await deleteBlogPost(id, tokenKey);
		res.json({
			result: 'ok',
			message: 'deleted blog post successfully'
		});
	} catch (error) {
		res.json({
			result: 'failed',
			message: `Cannot delete blog post: ${error}`
		});
	}
});
module.exports = router;
