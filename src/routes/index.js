const express = require('express')
const router = express.Router()

const postRoutes = require('./posts')
const categoryRoutes = require('./categories')
const imageRoutes = require('./images')

router.use('/posts', postRoutes)
router.use('/categories', categoryRoutes)
router.use('/images', imageRoutes)

module.exports = router
