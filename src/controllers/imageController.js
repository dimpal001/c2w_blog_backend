const { PrismaClient } = require('@prisma/client')
const slugify = require('slugify')
const prisma = new PrismaClient()

const getAllImages = async (request, response) => {
  try {
    const images = await prisma.images.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response.json({ images })
  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch images' })
  }
}

const getImageById = async (request, response) => {
  const { id } = request.params
  try {
    const image = await prisma.images.findUnique({
      where: { id },
    })
    if (!image) return response.status(404).json({ error: 'Image not found' })

    return response.status(200).json({ image })
  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch image' })
  }
}

const createImage = async (request, response) => {
  const { imageUrl, altText, note } = request.body
  try {
    const image = await prisma.images.create({
      data: { imageUrl, altText, note },
    })

    return response.status(201).json(image)
  } catch (error) {
    console.log(error)
    return response.status(500).json({ error: 'Failed to create image' })
  }
}

const updateImage = async (request, response) => {
  const { imageUrl, id, altText, note } = request.body
  try {
    const image = await prisma.images.update({
      where: { id },
      data: { imageUrl, altText, note },
    })
    return response.json(image)
  } catch (error) {
    console.log(error)
    return response.status(500).json({ error: 'Failed to update image' })
  }
}

const deleteImage = async (request, response) => {
  const { id } = request.params
  try {
    if (!id) {
      return response.status(400).json({ message: 'ID is required' })
    }
    await prisma.images.delete({ where: { id } })
    return response.json({ message: 'Image deleted successfully' })
  } catch (error) {
    return response.status(500).json({ error: 'Failed to delete image' })
  }
}

module.exports = {
  getAllImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
}
