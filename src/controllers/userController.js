const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/jwt');
const User = require('../models/User');

// ── API login — returns JSON token ──────────────────
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        return res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Browser login — sets session cookie ─────────────
exports.loginWeb = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/users/login');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/users/login');
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        req.session.token = token;
        req.session.user = { username: user.username };
        req.flash('success', `Welcome back, ${user.username}!`);
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong, please try again');
        res.redirect('/users/login');
    }
};

// ── API signup — returns JSON token ─────────────────
exports.signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ success: false, message: "Username already taken" });
        }

        const user = new User({ username, password });
        await user.save();

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        return res.status(201).json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Browser signup — auto-login after registration ──
exports.signupWeb = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    try {
        if (!username || !password) {
            req.flash('error', 'Username and password are required');
            return res.redirect('/users/signup');
        }

        if (password.length < 3) {
            req.flash('error', 'Password must be at least 3 characters');
            return res.redirect('/users/signup');
        }

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/users/signup');
        }

        const existing = await User.findOne({ username });
        if (existing) {
            req.flash('error', 'Username already taken, choose another');
            return res.redirect('/users/signup');
        }

        const user = new User({ username, password });
        await user.save();

        // Auto-login after signup
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        req.session.token = token;
        req.session.user = { username: user.username };
        req.flash('success', `Welcome to DevConnect, ${user.username}! 🎉`);
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            req.flash('error', 'Username already taken');
        } else {
            req.flash('error', 'Failed to create account, please try again');
        }
        res.redirect('/users/signup');
    }
};

// ── Logout ──────────────────────────────────────────
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/users/login');
    });
};