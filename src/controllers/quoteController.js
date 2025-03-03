const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const { default: slugify } = require('slugify')
const prisma = new PrismaClient()

const getAllQuotes = async (request, response) => {
  try {
    const quotes = await prisma.quotes.findMany({
      include: {
        category: true,
      },
    })

    response.status(200).json({ quotes })
  } catch (error) {
    response.status(500).json({ message: 'Failed to fetch quotes' })
  }
}

const addQuote = async (request, response) => {
  const { text, categoryId, hyperLink = null, imageUrl = null } = request.body
  try {
    if (!text) {
      return response.status(400).json({ message: 'Enter a valid quote' })
    }

    if (!categoryId) {
      return response.status(400).json({ message: 'Select a valid category' })
    }

    const quote = await prisma.quotes.create({
      data: {
        text,
        hyperLink,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    })

    response.status(200).json({ quote })
  } catch (error) {
    console.error('Error creating quote :', error)
    response.status(500).json({ message: 'Failed to create quote' })
  }
}

const updateQuote = async (request, response) => {
  const {
    id,
    text,
    categoryId,
    hyperLink = null,
    imageUrl = null,
  } = request.body
  try {
    if (!text) {
      return response.status(400).json({ message: 'Enter a valid quote' })
    }

    if (!categoryId) {
      return response.status(400).json({ message: 'Select a valid category' })
    }

    const quote = await prisma.quotes.update({
      where: {
        id,
      },
      data: {
        text,
        hyperLink,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    })

    response.status(200).json({ quote })
  } catch (error) {
    console.error('Error creating quote :', error)
    response.status(500).json({ message: 'Failed to update quote' })
  }
}

const deleteQuote = async (request, response) => {
  const { id } = request.query
  try {
    await prisma.quotes.delete({
      where: { id },
    })

    response.status(200).json({ message: 'Quote deleted successfully' })
  } catch (error) {
    response.status(500).json({ message: 'Failed to delete quotes' })
  }
}

module.exports = {
  getAllQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
}
