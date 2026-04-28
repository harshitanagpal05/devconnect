const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { verifyToken } = require('../middlewares/userMiddleware');

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', verifyToken, postController.createPost);
router.patch('/:id', verifyToken, postController.updatePost);
router.delete('/:id', verifyToken, postController.deletePost);

module.exports = router;