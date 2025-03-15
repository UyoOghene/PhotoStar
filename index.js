if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Secret:', process.env.SECRET);

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const path = require('path');
const Post = require("./models/post");
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const { isLoggedIn, isAuthor, isCommentAuthor, validatePost, validateComment } = require("./middleware");
const flash = require('connect-flash');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


require("dotenv").config();

const app = express();
mongoose.connect('mongodb://localhost:27017/photo-star');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// App Configuration
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
const postRoutes = require("./routes/posts");
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');

app.use("/posts", postRoutes);
app.use("/", userRoutes);
// app.use('/posts/:id/comments', commentRoutes);

// Home Route
app.get('/', (req, res) => {
    res.render('home');
});

// 404 Error Handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// General Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});
