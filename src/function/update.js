const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const udpate = async () => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        ogImage: null,
      },
      select: {
        id: true,
        thumbnailImage: true,
      },
    })

    for (const post of posts) {
      const newOgImage = `https://clothes2wear.blr1.cdn.digitaloceanspaces.com/images/${post.thumbnailImage}`
      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          ogImage: newOgImage,
        },
      })
    }

    console.log(`Updated ${posts.length} posts with ogImage.`)
  } catch (error) {
    console.error('Error updating posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

udpate()
