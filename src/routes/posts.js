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
router.get('/by-id', authenticateJWT, getPostById)
router.get('/by-slug', getPostBySlug)
router.get('/by-search', getPostBySearchQuery)
router.post('/', authenticateJWT, createPost)
router.put('/', authenticateJWT, updatePost)
router.put('/active-post', authenticateJWT, activePost)
router.put('/inactive-post', authenticateJWT, inactivePost)
router.delete('/', authenticateJWT, deletePost)

module.exports = router
