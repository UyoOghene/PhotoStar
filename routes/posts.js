const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require('../models/comment');
const User = require('../models/user')

const catchAsync = require("../utilities/catchAsync");
const ExpressError = require('../utilities/ExpressError');
const { isLoggedIn, isAuthor, isCommentAuthor, validatePost, validateComment } = require("../middleware");
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage});


// Show all posts
router.get("/", catchAsync(async (req, res) => {
    const posts = await Post.find({});
    res.render("posts/index", { posts });
}));

// Create a new post
router.post("/", isLoggedIn, upload.array('image'), validatePost, catchAsync(async (req, res) => {
    const { imageUrl, caption } = req.body.post;
    
    // Create a new post object
    const newPost = new Post({ imageUrl, caption, author: req.user._id });

    // Assign uploaded image data
    newPost.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

    req.files.forEach(file => {
        console.log('Uploaded Image URL:', file.path);
        console.log('Uploaded Image file:', file.filename);
    });

    await newPost.save();
    req.flash('success', 'Created a new post!');
    res.redirect("/posts");
}));

// router.post("/", upload.array('image'), (req, res) => {
//     console.log(req.body, req.files); // Confirm what data is received
//     res.send('worked');
// });

// Show form to create a new post
router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
});

// Show edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        req.flash('error', 'Post not found!');
        return res.redirect('/posts');
    }
    res.render('posts/edit', { post });
}));


// Show a single post
router.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('author')
        .populate({
            path: 'comments',
            populate: { path: 'author' } // Ensures author details appear in comments
        });

    if (!post) {
        req.flash('error', 'Post not found!');
        return res.redirect('/posts');
    }

    res.render('posts/show', { post });
});
// Add a comment to a post
router.post('/:id/comments', isLoggedIn, validateComment, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Comment added successfully!');
    res.redirect(`/posts/${post._id}`);
}));


// Update a post
router.put('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Updated post!');
    res.redirect(`/posts/${post._id}`);
}));


// Delete a comment
router.delete('/:id/comments/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentid } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentid);
    req.flash('success', 'Deleted comment');
    res.redirect(`/posts/${id}`);
}));

// Delete a post
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Deleted post');
    res.redirect("/posts");
}));

module.exports = router;
