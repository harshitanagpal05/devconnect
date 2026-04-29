const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/jwt');

// API middleware — checks Authorization header
exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (header && header.startsWith("Bearer ")) {
        const token = header.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        } catch {
            return res.status(403).json({ message: "Invalid token" });
        }
    }

    // Check session token (for browser/EJS flow)
    if (req.session && req.session.token) {
        try {
            const decoded = jwt.verify(req.session.token, JWT_SECRET);
            req.user = decoded;
            return next();
        } catch {
            req.session.destroy();
            req.flash('error', 'Session expired, please login again');
            return res.redirect('/users/login');
        }
    }

    // No token found
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({ message: "No token" });
    }

    req.flash('error', 'Please login to continue');
    res.redirect('/users/login');
};

// Simple middleware to check if user is logged in (for views)
exports.isLoggedIn = (req, res, next) => {
    if (req.session && req.session.token) {
        try {
            const decoded = jwt.verify(req.session.token, JWT_SECRET);
            req.user = decoded;
            return next();
        } catch {
            // Token expired
        }
    }
    next();
};