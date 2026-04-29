const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: { type: String, required: true },
    text: { type: String, required: true }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String },
    likes: [{ type: String }],          // array of usernames who liked
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);