const express = require('express')
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', authenticateJWT, getAllCategories)
router.get('/:id', getCategoryById)
router.post('/', authenticateJWT, createCategory)
router.put('/', authenticateJWT, updateCategory)
router.delete('/:id', authenticateJWT, deleteCategory)

module.exports = router
