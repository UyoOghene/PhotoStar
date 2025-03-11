const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const path = require('path');
const Post = require("./models/post");
const catchAsync =  require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');

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

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
// Home route
app.get('/', (req, res) => {
    res.send('Hello from photostar');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


app.listen(3000, () => console.log("Server running on port 3000"));
