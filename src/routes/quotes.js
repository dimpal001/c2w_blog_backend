const express = require('express')
const {
  getAllQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
} = require('../controllers/quoteController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', authenticateJWT, getAllQuotes)
router.post('/add-quote', authenticateJWT, addQuote)
router.patch('/update-quote', authenticateJWT, updateQuote)
router.delete('/delete-quote', authenticateJWT, deleteQuote)

module.exports = router
