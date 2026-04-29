const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const { verifyToken } = require('../middlewares/userMiddleware');

// View routes (must come before /:id)
router.get('/new', verifyToken, postController.getCreateForm);
router.get('/:id/edit', verifyToken, postController.getEditForm);

// CRUD routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', verifyToken, postController.createPost);
router.post('/:id', verifyToken, postController.updatePost);       // HTML form PUT via POST
router.patch('/:id', verifyToken, postController.updatePost);       // API
router.delete('/:id', verifyToken, postController.deletePost);      // API
router.post('/:id/delete', verifyToken, postController.deletePost); // HTML form DELETE via POST

// ── Like / Comment ──────────────────────────────────
router.post('/:id/like', verifyToken, postController.toggleLike);
router.post('/:id/comment', verifyToken, postController.addComment);

module.exports = router;