const express = require("express");
const router = express.Router();
const Post = require("../models/post");

// Show all posts
router.get("/", async (req, res) => {
//   const posts = await Post.find().populate("author");
//   res.render("posts/index", { posts });
res.send('home')
});

// // Show form to create a new post
// router.get("/new", (req, res) => res.render("posts/new"));
router.get("/new", (req, res) =>res.send('new post')
);

// // Create a new post
// router.post("/", async (req, res) => {
//   const { imageUrl, caption } = req.body;
//   const newPost = new Post({ imageUrl, caption, author: req.user._id });
//   await newPost.save();
//   res.redirect("/posts");
// });

// // Delete a post
// router.delete("/:id", async (req, res) => {
//   await Post.findByIdAndDelete(req.params.id);
//   res.redirect("/posts");
// });

module.exports = router;
