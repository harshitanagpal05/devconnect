const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "123") {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

        return res.json({
            success: true,
            token
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid credentials"
    });
};