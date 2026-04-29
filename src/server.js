require('dotenv').config();
const app = require('./app');
const connectDB = require('../config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n  ✦ DevConnect running → http://localhost:${PORT}\n`);
    });
}).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});