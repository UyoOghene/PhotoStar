const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require('../models/comment');

// Show all posts
router.get("/", async (req, res) => {
    const posts = await Post.find({});
    res.render("posts/index", { posts });
});

// Show form to create a new post
router.get('/new', (req, res) => {
  res.render('posts/new');
});

// Show edit form
router.get('/:id/edit', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
      return res.status(404).send("Post not found");
  }
  res.render('posts/edit', { post });
});


// Create a new post
router.post("/", async (req, res) => {
    const { imageUrl, caption } = req.body.post;
    const newPost = new Post({ imageUrl, caption });
    await newPost.save();
    res.redirect("/posts");
});

// Show a single post
router.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/show', { post });
});

// Update a post
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    res.redirect(`/posts/${post._id}`);
});

// Delete a post
router.delete("/:id", async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/posts");
});

module.exports = router;
