const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// ── View Engine ──────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static Files ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body Parsers ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Session & Flash ──────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'devconnect_fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true
    }
}));
app.use(flash());

// ── Global Template Variables ────────────────────────────
app.use((req, res, next) => {
    res.locals.currentUser = req.session ? req.session.user : null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ── Routes ───────────────────────────────────────────────
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const { isLoggedIn } = require('./middlewares/userMiddleware');

// Home page redirects to posts feed
app.get('/', isLoggedIn, (req, res) => {
    res.redirect('/posts');
});

app.use('/posts', isLoggedIn, postRoutes);
app.use('/users', userRoutes);

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 — DevConnect',
        message: 'Page not found',
        error: {}
    });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        title: 'Error — DevConnect',
        message: err.message || 'Something went wrong',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

module.exports = app;