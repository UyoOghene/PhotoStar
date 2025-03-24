const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require('../models/comment');
const User = require('../models/user')
const Joi = require('joi');
const { cloudinary } = require('../cloudinary/index'); 

const catchAsync = require("../utilities/catchAsync");
const ExpressError = require('../utilities/ExpressError');
const { isLoggedIn, isAuthor, isCommentAuthor, validatePost, validateComment } = require("../middleware");
const multer = require('multer');

const { storage } = require('../cloudinary/index');
const upload = multer({ storage});
const moment = require('moment');


// Show all posts

router.get("/", catchAsync(async (req, res) => {
    const posts = await Post.find({}).populate('author');
    res.render("posts/index", { posts, moment });
}));


router.post("/", isLoggedIn, upload.array('image'), (req, res, next) => {
    req.body.post.image = req.files.map(f => f.path); // ✅ Add images to `req.body.post.image`
    next();
}, validatePost, catchAsync(async (req, res) => {
    const { caption } = req.body.post;
        // const {author}= req.user._id;
    const newPost = new Post({ caption, author: req.user._id });

    newPost.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

    await newPost.save();
    req.flash('success', 'Created a new post!');
    res.redirect("/posts",{moment,post,author});
}));


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
        return res.redirect('/posts',);
    }

    res.render('posts/show', { post, currentUser: req.user, moment });
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


router.put('/:id', isLoggedIn, isAuthor, upload.array('images'), catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    // Delete old images ONLY IF new images are uploaded
    if (req.files && req.files.length > 0) {
        if (post.images && post.images.length > 0) {
            for (let img of post.images) {
                await cloudinary.uploader.destroy(img.filename);  // Deletes from Cloudinary
            }
        }

        // Add new images
        const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }));
        post.images = imgs;
    }

    // Update caption (or other post data)
    post.caption = req.body.post.caption;

    await post.save();

    req.flash('success', 'Updated post!');
    res.redirect(`/posts/${post._id}`);
}));

// Delete a comment
router.delete('/:id/comments/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } }); 
    await Comment.findByIdAndDelete(commentId);  
    // req.flash('success', 'Deleted comment');
    res.redirect(`/posts/${id}`);
}));

// router.post('/:id/like', isLoggedIn, async (req, res) => {
//     const { id } = req.params;
//     const post = await Post.findById(id);

//     if (!post) {
//         req.flash('error', 'Post not found.');
//         return res.redirect('/posts');
//     }

//     const likeIndex = post.likes.indexOf(req.user._id);
//     if (likeIndex === -1) {
//         post.likes.push(req.user._id);
//     } else {
//         post.likes.splice(likeIndex, 1);
//     }

//     await post.save();
//     res.redirect(`/posts/${id}`);
// });

router.post('/:id/like', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
        req.flash('error', 'Post not found.');
        return res.redirect('/posts');
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    let liked = false;

    if (likeIndex === -1) {
        post.likes.push(req.user._id);
        liked = true;
    } else {
        post.likes.splice(likeIndex, 1);
    }

    await post.save();

    // Send JSON data for AJAX functionality or redirect for traditional form
    if (req.headers['accept'].includes('application/json')) {
        return res.json({ likesCount: post.likes.length, liked });
    }

    res.redirect(`/posts/${id}`);
});

// Delete a post
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Deleted post');
    res.redirect("/posts");
}));

module.exports = router;