const Post = require('../models/Post');
// GET all posts
exports.getAllPosts = async (req, res) => {
    const posts = await Post.find();

    res.json({
        success: true,
        data: posts
    });
};

// GET single post
exports.getPostById = async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }

    res.json(post);
};

// CREATE post
exports.createPost = async (req, res) => {
    const { title, content } = req.body;

    const post = await Post.create({ title, content });

    res.status(201).json({
        success: true,
        data: post
    });
};

// UPDATE
exports.updatePost = async (req, res) => {
    const post = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(post);
};

// DELETE
exports.deletePost = async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });
};