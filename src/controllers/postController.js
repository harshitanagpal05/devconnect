const Post = require('../models/Post');

// GET all posts — render view
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ success: true, data: posts });
        }

        res.render('home', {
            title: 'DevConnect — Developer Blog',
            posts
        });
    } catch (err) {
        console.error(err);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        res.status(500).render('error', {
            title: 'Error — DevConnect',
            message: 'Failed to load posts',
            error: process.env.NODE_ENV === 'production' ? {} : err
        });
    }
};

// GET single post — render view
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({ message: "Not found" });
            }
            return res.status(404).render('error', {
                title: '404 — DevConnect',
                message: 'Post not found',
                error: {}
            });
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(post);
        }

        res.render('post', {
            title: `${post.title} — DevConnect`,
            post
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(404).render('error', {
                title: '404 — DevConnect',
                message: 'Post not found',
                error: {}
            });
        }
        res.status(500).render('error', {
            title: 'Error — DevConnect',
            message: 'Failed to load post',
            error: process.env.NODE_ENV === 'production' ? {} : err
        });
    }
};

// GET create form
exports.getCreateForm = (req, res) => {
    res.render('create', {
        title: 'New Post — DevConnect'
    });
};

// GET edit form
exports.getEditForm = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }
        res.render('edit', {
            title: `Edit: ${post.title} — DevConnect`,
            post
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to load post for editing');
        res.redirect('/posts');
    }
};

// CREATE post
exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({ success: false, message: 'Title and content are required' });
            }
            req.flash('error', 'Title and content are required');
            return res.redirect('/posts/new');
        }

        const author = req.user ? req.user.username : 'anonymous';

        // Use explicit new + save (not Post.create) to guarantee insert
        const post = new Post({ title, content, author });
        await post.save();

        console.log(`[POST CREATED] id=${post._id} title="${post.title}" author="${post.author}"`);

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json({ success: true, data: post });
        }

        req.flash('success', 'Post published successfully!');
        res.redirect(`/posts/${post._id}`);
    } catch (err) {
        console.error('[POST CREATE ERROR]', err);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        req.flash('error', 'Failed to create post');
        res.redirect('/posts/new');
    }
};

// UPDATE
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!post) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({ message: 'Not found' });
            }
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(post);
        }

        req.flash('success', 'Post updated successfully!');
        res.redirect(`/posts/${post._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update post');
        res.redirect('/posts');
    }
};

// DELETE
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(404).json({ message: 'Not found' });
            }
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ message: "Deleted" });
        }

        req.flash('success', 'Post deleted successfully');
        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to delete post');
        res.redirect('/posts');
    }
};

// ── TOGGLE LIKE ─────────────────────────────────────
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }

        const username = req.user.username;
        const idx = post.likes.indexOf(username);

        if (idx === -1) {
            post.likes.push(username);
        } else {
            post.likes.splice(idx, 1);
        }

        await post.save();
        res.redirect(`/posts/${post._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to like post');
        res.redirect('/posts');
    }
};

// ── ADD COMMENT ─────────────────────────────────────
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }

        const { text } = req.body;
        if (!text || !text.trim()) {
            req.flash('error', 'Comment cannot be empty');
            return res.redirect(`/posts/${post._id}`);
        }

        post.comments.push({
            author: req.user.username,
            text: text.trim()
        });

        await post.save();
        req.flash('success', 'Comment added!');
        res.redirect(`/posts/${post._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to add comment');
        res.redirect('/posts');
    }
};