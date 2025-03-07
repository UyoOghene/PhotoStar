const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  imageUrl: String,
  caption: String,
//   createdAt: { type: Date, default: Date.now },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Post", postSchema);
