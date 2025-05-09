const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require('../models/comment');
const User = require('../models/user')
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require('../utilities/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { isLoggedIn, isAuthor, isCommentAuthor, validatePost, validateComment } = require("../middleware");

router.get('/register', (req, res) => {
    res.render('users/register');  // ✅ Correct path
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to PhotoStar!');
            res.redirect('/posts');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome ');
    const redirectUrl = req.session.returnTo || '/posts';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        req.flash('success', "Goodbye!");
        res.redirect('/posts');
    });
});

module.exports = router;