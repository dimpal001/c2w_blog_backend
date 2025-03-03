const express = require('express')
const {
  getAllQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
} = require('../controllers/quoteController')
const authenticateJWT = require('../middleware/authentication')

const router = express.Router()

router.get('/', getAllQuotes)
router.post('/add-quote', addQuote)
router.patch('/update-quote', updateQuote)
router.delete('/delete-quote', deleteQuote)

module.exports = router
