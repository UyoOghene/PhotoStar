const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require('../models/comment');
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require('../utilities/ExpressError');
const { isLoggedIn } = require("../middleware");


// Show all posts
router.get("/", catchAsync(async (req, res) => {
    const posts = await Post.find({});
    res.render("posts/index", { posts });
}));

// Show form to create a new post
router.get('/new',isLoggedIn,(req, res) => {
  res.render('posts/new');
  req.flash('success', 'Made a new Post')
});

// Show edit form
router.get('/:id/edit',isLoggedIn, catchAsync (async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
      return res.status(404).send("Post not found");
  }
  res.render('posts/edit', { post });
}));


// Create a new post
router.post("/",isLoggedIn, catchAsync( async (req, res) => {
    if (!req.body.post) throw new ExpressError('Invalid post Data', 400);
    const { imageUrl, caption } = req.body.post;
    const newPost = new Post({ imageUrl, caption });
    await newPost.save();
    req.flash('success', 'created  new post')
    res.redirect("/posts");
}));


// Show a single post
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('comments'); // Ensure comments are populated
    res.render('posts/show', { post });
}));


// Update a post
router.put('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'updated post')

    res.redirect(`/posts/${post._id}`);
}));

router.post('/:id/comments',isLoggedIn, catchAsync(async(req, res) => {
    const post = await Post.findById(req.params.id).populate('comments')
    const comment = new Comment(req.body.comment)
    await comment.save();
    post.comments.push(comment); // Save reference to post
    await post.save();
    res.redirect(`/posts/${post._id}`);
}));

router.delete('/:id/comments/:commentid',isLoggedIn, catchAsync(async(req,res) => {
    const { id, commentid } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentid } });
    await Comment.findByIdAndDelete(commentid);
    req.flash('success', 'deleted comment')

    res.redirect(`/posts/${id}`);
}));


// Delete a post
router.delete("/:id",isLoggedIn, catchAsync( async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'deleted post')

    res.redirect("/posts");
}));

module.exports = router;
