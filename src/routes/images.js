const express = require('express')
const {
  getAllImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
} = require('../controllers/imageController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', authenticateJWT, getAllImages)
router.get('/:id', getImageById)
router.post('/', authenticateJWT, createImage)
router.put('/', authenticateJWT, updateImage)
router.delete('/:id', authenticateJWT, deleteImage)

module.exports = router
