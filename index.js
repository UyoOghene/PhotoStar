const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const path = require('path');
const Post = require("./models/post");

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

// Routes
const postRoutes = require("./routes/posts");
app.use("/posts", postRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Hello from photostar');
});

// Show form to create a new post
app.get('/new', (req, res) => {
    res.render('posts/new');
});

// Show edit form
app.get('/posts/:id/edit', async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    res.render('posts/edit', { post });
});

app.listen(3000, () => console.log("Server running on port 3000"));
