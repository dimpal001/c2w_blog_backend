const express = require('express')
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  activePost,
  inactivePost,
  deletePost,
  getPostBySlug,
  getPostBySearchQuery,
} = require('../controllers/postController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', authenticateJWT, getAllPosts)
router.get('/:id', authenticateJWT, getPostById)
router.get('/post/:slug', getPostBySlug)
router.get('/query', getPostBySearchQuery)
router.post('/', authenticateJWT, createPost)
router.put('/', authenticateJWT, updatePost)
router.put('/active/:id', authenticateJWT, activePost)
router.put('/inactive/:id', authenticateJWT, inactivePost)
router.delete('/:id', authenticateJWT, deletePost)

module.exports = router
