const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require('../models/comment');
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require('../utilities/ExpressError');


// Show all posts
router.get("/", catchAsync(async (req, res) => {
    const posts = await Post.find({});
    res.render("posts/index", { posts });
}));

// Show form to create a new post
router.get('/new', (req, res) => {
  res.render('posts/new');
});

// Show edit form
router.get('/:id/edit', catchAsync (async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
      return res.status(404).send("Post not found");
  }
  res.render('posts/edit', { post });
}));


// Create a new post
router.post("/", catchAsync( async (req, res) => {
    if (!req.body.post) throw new ExpressError('Invalid post Data', 400);
    const { imageUrl, caption } = req.body.post;
    const newPost = new Post({ imageUrl, caption });
    await newPost.save();
    res.redirect("/posts");
}));


// Show a single post
router.get('/:id', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('comments'); // Ensure comments are populated
    res.render('posts/show', { post });
}));


// Update a post
router.put('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    res.redirect(`/posts/${post._id}`);
}));

router.post('/:id/comments', catchAsync(async(req, res) => {
    const post = await Post.findById(req.params.id).populate('comments')
    const comment = new Comment(req.body.comment)
    await comment.save();
    post.comments.push(comment); // Save reference to post
    await post.save();
    res.redirect(`/posts/${post._id}`);
}));

router.delete('/:id/comments/:commentid', catchAsync(async(req,res) => {
    const { id, commentid } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentid } });
    await Comment.findByIdAndDelete(commentid);
    res.redirect(`/posts/${id}`);
}));


// Delete a post
router.delete("/:id", catchAsync( async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/posts");
}));

module.exports = router;
