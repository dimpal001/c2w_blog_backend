const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const routes = require('./routes')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const helmet = require('helmet')
app.use(helmet())

const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use(limiter)

app.use('/api', routes)

app.use((error, request, response, next) => {
  console.error(error.stack)
  response.status(500).json({ message: 'Something went wrong!' })
})

module.exports = app
