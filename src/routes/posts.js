const express = require('express')
const {
  getAllPosts,
  getMostLikedPosts,
  getPostById,
  getAllPostsCategoryWise,
  getPostByCategory,
  createPost,
  updatePost,
  likePost,
  activePost,
  inactivePost,
  deletePost,
  getPostBySlug,
  getPostBySearchQuery,
} = require('../controllers/postController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', getAllPosts)
router.get('/get-most-liked', getMostLikedPosts)
router.get('/:id', authenticateJWT, getPostById)
router.get('/post/category-wise-post', getAllPostsCategoryWise)
router.get('/post-by-category/:slug', getPostByCategory)
router.get('/post/:slug', getPostBySlug)
router.get('/query', getPostBySearchQuery)
router.post('/', authenticateJWT, createPost)
router.put('/', authenticateJWT, updatePost)
router.put('/like-post', likePost)
router.put('/active/:id', authenticateJWT, activePost)
router.put('/inactive/:id', authenticateJWT, inactivePost)
router.delete('/:id', authenticateJWT, deletePost)

module.exports = router
