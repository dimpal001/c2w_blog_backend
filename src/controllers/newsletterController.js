const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAllNewsletters = async (request, response) => {
  try {
    const newsletters = await prisma.newsletter.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    response.json(newsletters)
  } catch (error) {
    console.log(error)
    response.status(500).json({ message: 'Failed to fetch newsletters' })
  }
}

const createNewsletter = async (request, response) => {
  const { email } = request.body

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return response.status(400).json({ message: 'Email cannot be empty!' })
  }
  if (!emailRegex.test(email)) {
    return response.status(400).json({ message: 'Invalid email format!' })
  }

  try {
    const isExist = await prisma.newsletter.findUnique({
      where: { email },
    })

    if (isExist) {
      return response.status(400).json({ message: 'Email already exists!' })
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        email,
      },
    })
    response.status(201).json({
      message: 'Email successfully added to the newsletter!',
      data: newsletter,
    })
  } catch (error) {
    console.error(error)
    response.status(500).json({ message: 'Failed to create newsletter' })
  }
}

const deleteNewsletter = async (request, response) => {
  const { id } = request.params
  try {
    await prisma.newsletter.delete({ where: { id } })
    response.json({ message: 'Newsletter deleted successfully' })
  } catch (error) {
    response.status(500).json({ message: 'Failed to delete newsletter' })
  }
}

module.exports = {
  getAllNewsletters,
  createNewsletter,
  deleteNewsletter,
}
