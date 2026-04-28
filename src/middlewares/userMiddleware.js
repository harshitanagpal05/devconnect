const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ message: "Invalid token" });
    }
};