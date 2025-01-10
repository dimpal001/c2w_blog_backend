const express = require('express')
const router = express.Router()

const postRoutes = require('./posts')
const categoryRoutes = require('./categories')
const imageRoutes = require('./images')
const newsletterRoutes = require('./newsletters')

router.use('/posts', postRoutes)
router.use('/categories', categoryRoutes)
router.use('/images', imageRoutes)
router.use('/newsletters', newsletterRoutes)

module.exports = router
