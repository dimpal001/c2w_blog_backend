const { PrismaClient } = require('@prisma/client')
const { default: slugify } = require('slugify')
const prisma = new PrismaClient()

const getAllPosts = async (request, response) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        slug: true,
        thumbnailImage: true,
        createdAt: true,
        content: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    response.json(posts)
  } catch (error) {
    response.status(500).json({ message: 'Failed to fetch posts' })
  }
}

const getPostById = async (request, response) => {
  const { id } = request.params
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { categories: true },
    })
    if (!post) return response.status(404).json({ message: 'Post not found' })

    const categoriesIds = post.categories.map((category) => category.id)

    response.json({
      ...post,
      categories: categoriesIds,
    })
  } catch (error) {
    response.status(500).json({ message: 'Failed to fetch post' })
  }
}

const getPostBySlug = async (request, response) => {
  const { slug } = request.params
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { categories: true },
    })
    if (!post) return response.status(404).json({ message: 'Post not found' })
    response.status(200).json(post)
  } catch (error) {
    response.status(500).json({ message: 'Failed to fetch post' })
  }
}

const getPostBySearchQuery = async (request, response) => {
  const { query } = request.params

  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            categories: {
              some: {
                slug: {
                  contains: query,
                },
              },
            },
          },
        ],
        AND: [
          {
            status: 'ACTIVE',
          },
        ],
      },
      include: {
        categories: true,
      },
    })

    if (posts.length === 0) {
      return response.status(404).json({ message: 'No posts found' })
    }

    return response.status(200).json(posts)
  } catch (error) {
    return response.status(500).json({ message: 'Failed to fetch post' })
  }
}

const createPost = async (request, response) => {
  const { title, userId, thumbnailImage, content, tags, categories } =
    request.body
  try {
    const slug = slugify(title, { lower: true, strict: true })

    const isExist = await prisma.post.findUnique({
      where: { slug },
    })

    if (isExist) {
      return response.status(400).json({ message: 'Title is already exist!' })
    }

    if (!title || title === '') {
      return response
        .status(400)
        .json({ message: 'Title is required and cannot be empty' })
    }

    if (!userId || userId === '') {
      return response.status(400).json({
        message:
          'User ID is required. Please log in again to ensure your session is active',
      })
    }

    if (!thumbnailImage || thumbnailImage === '') {
      return response
        .status(400)
        .json({ message: 'Thumbnail image is required.' })
    }

    if (!content || content === '') {
      return response
        .status(400)
        .json({ message: 'Blog content cannot be empty' })
    }

    if (!categories || categories.length === 0) {
      return response
        .status(400)
        .json({ message: 'At least one category is required for the post.' })
    }

    const post = await prisma.post.create({
      data: {
        title,
        userId,
        slug,
        status: 'PENDING',
        thumbnailImage,
        content,
        tags,
        categories: { connect: categories.map((id) => ({ id })) },
      },
    })
    response.status(201).json(post)
  } catch (error) {
    console.log(error)
    response.status(500).json({ message: 'Failed to create post' })
  }
}

const updatePost = async (request, response) => {
  const {
    id,
    title,
    userId,
    status,
    thumbnailImage,
    content,
    tags,
    categories,
  } = request.body
  try {
    const slug = slugify(title, { lower: true, strict: true })
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        userId,
        slug,
        status,
        thumbnailImage,
        content,
        tags,
        categories: { set: categories.map((id) => ({ id })) },
      },
    })
    response.json(post)
  } catch (error) {
    console.log(error)
    response.status(500).json({ message: 'Failed to update post' })
  }
}

const activePost = async (request, response) => {
  const { id } = request.params
  try {
    if (!id) {
      return response.json(400).json({ message: 'Post ID should be provided' })
    }
    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    })
    if (!post) {
      return response.status(400).json({ message: 'Post not found' })
    }

    return response
      .status(200)
      .json({ post, message: 'Post has been activated' })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ message: 'Failed to active post' })
  }
}

const inactivePost = async (request, response) => {
  const { id } = request.params
  try {
    if (!id) {
      return response.json(400).json({ message: 'Post ID should be provided' })
    }
    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    })
    if (!post) {
      return response.status(400).json({ message: 'Post not found' })
    }

    return response
      .status(200)
      .json({ post, message: 'Post has been inactivated' })
  } catch (error) {
    return response.status(500).json({ message: 'Failed to inactive post' })
  }
}

const deletePost = async (request, response) => {
  const { id } = request.params
  try {
    await prisma.post.delete({ where: { id } })
    response.json({ message: 'Post deleted successfully' })
  } catch (error) {
    response.status(500).json({ message: 'Failed to delete post' })
  }
}

module.exports = {
  getAllPosts,
  getPostById,
  getPostBySlug,
  getPostBySearchQuery,
  createPost,
  updatePost,
  activePost,
  inactivePost,
  deletePost,
}
