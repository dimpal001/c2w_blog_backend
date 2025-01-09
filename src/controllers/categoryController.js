const { PrismaClient } = require('@prisma/client')
const slugify = require('slugify')
const prisma = new PrismaClient()

const getAllCategories = async (request, response) => {
  try {
    const categories = await prisma.category.findMany()
    return response.json({ categories })
  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch categories' })
  }
}

const getCategoryById = async (request, response) => {
  const { id } = request.params
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    })
    if (!category)
      return response.status(404).json({ error: 'Category not found' })

    return response.status(200).json({ category })
  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch category' })
  }
}

const createCategory = async (request, response) => {
  const { name } = request.body
  const slug = slugify(name, { lower: true, strict: true })
  try {
    const isExist = await prisma.category.findUnique({
      where: { slug },
    })

    if (isExist) {
      return response
        .status(400)
        .json({ message: 'Category is already exist!' })
    }

    const category = await prisma.category.create({
      data: { name, slug },
    })

    return response.status(201).json(category)
  } catch (error) {
    console.log(error)
    return response.status(500).json({ error: 'Failed to create category' })
  }
}

const updateCategory = async (request, response) => {
  const { name, id } = request.body
  try {
    const slug = slugify(name, { lower: true, strict: true })
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug },
    })
    return response.json(category)
  } catch (error) {
    console.log(error)
    return response.status(500).json({ error: 'Failed to update category' })
  }
}

const deleteCategory = async (request, response) => {
  console.log(request.params)
  const { id } = request.params
  try {
    if (!id) {
      return response.status(400).json({ message: 'ID is required' })
    }
    await prisma.category.delete({ where: { id } })
    return response.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return response.status(500).json({ error: 'Failed to delete category' })
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}
