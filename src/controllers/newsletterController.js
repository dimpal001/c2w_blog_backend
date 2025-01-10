const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAllNewsletters = async (request, response) => {
  try {
    const newsletters = await prisma.newsletter.findMany({
      select: {
        id,
        email,
        createdAt,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    response.json(newsletters)
  } catch (error) {
    response.status(500).json({ message: 'Failed to fetch newsletters' })
  }
}

const createNewsletter = async (request, response) => {
  const { email } = request.body
  try {
    const isExist = await prisma.newsletter.findUnique({
      where: { email },
    })

    if (isExist) {
      return response.status(400).json({ message: 'Email is already exist!' })
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        email,
      },
    })
    response.status(201).json(newsletter)
  } catch (error) {
    console.log(error)
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
