const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/userRoutes');

app.use('/posts', postRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('API Running');
});

module.exports = app;