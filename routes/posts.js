const express = require("express");
const router = express.Router();
const Post = require("../models/post");

// Show all posts
router.get("/", async (req, res) => {
    const posts = await Post.find({});
//   const posts = await Post.find().populate("author");
  res.render("../views/posts/index", { posts });
// res.send('home')
});

// // Show form to create a new post
router.get("/new", (req, res) =>
    res.render('../views/posts/new.ejs')

);


// router.get('/:id', async (req, res,) => {
//     const post = await Post.findById(req.params.id)
//     res.render('views/show', { post });
// });

// Create a new post
router.post("/", async (req, res) => {
  const { imageUrl, caption } = req.body.post;
  const newPost = new Post({ imageUrl, caption });
  await newPost.save();
  res.redirect("/posts");
});

// // Delete a post
// router.delete("/:id", async (req, res) => {
//   await Post.findByIdAndDelete(req.params.id);
//   res.redirect("/posts");
// });

module.exports = router;
