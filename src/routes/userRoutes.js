const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ── API routes (JSON) ───────────────────────────────
router.post('/login', userController.login);
router.post('/signup', userController.signup);

// ── Browser login page ──────────────────────────────
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login — DevConnect'
    });
});

// ── Browser signup page ─────────────────────────────
router.get('/signup', (req, res) => {
    res.render('signup', {
        title: 'Sign Up — DevConnect'
    });
});

// ── Browser form handlers ───────────────────────────
router.post('/login/web', userController.loginWeb);
router.post('/signup/web', userController.signupWeb);

// ── Logout ──────────────────────────────────────────
router.get('/logout', userController.logout);

module.exports = router;