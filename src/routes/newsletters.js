const express = require('express')
const {
  getAllNewsletters,
  deleteNewsletter,
  createNewsletter,
} = require('../controllers/newsletterController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', authenticateJWT, getAllNewsletters)
router.post('/', createNewsletter)
router.delete('/:id', authenticateJWT, deleteNewsletter)

module.exports = router
