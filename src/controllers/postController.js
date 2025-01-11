const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
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
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedPosts = posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
    }))

    response.json(formattedPosts)
  } catch (error) {
    response.status(500).json({ message: 'Failed to fetch posts' })
  }
}

const getMostLikedPosts = async (request, response) => {
  try {
    const posts = await prisma.post.findMany({
      take: 6,
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        thumbnailImage: true,
        thumbnailImageAltText: true,
        createdAt: true,
        likes: {
          select: {
            id: true,
          },
        },
      },
    })

    const result = posts.map((post) => ({
      ...post,
      likeCount: post.likes.length,
    }))

    response.json(result)
  } catch (error) {
    console.error('Error fetching most liked posts:', error)
    response.status(500).json({ message: 'Failed to fetch most liked posts' })
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

const getAllPostsCategoryWise = async (request, response) => {
  try {
    const products = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailImage: true,
            thumbnailImageAltText: true,
          },
        },
      },
    })

    return response.status(200).json(products)
  } catch (error) {
    console.log(error)
    return response.status(500).json({ message: 'Failed to fetch posts' })
  }
}

const getPostByCategory = async (request, response) => {
  const { slug } = request.params

  try {
    if (!slug) {
      return response
        .status(404)
        .json({ message: 'Category slug is not provided' })
    }

    const posts = await prisma.post.findMany({
      where: {
        categories: {
          some: { slug: slug },
        },
      },
      include: { categories: true },
    })

    if (posts.length === 0) {
      return response
        .status(404)
        .json({ message: 'No posts found for this category' })
    }

    response.json(posts)
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    response.status(500).json({ message: 'Failed to fetch posts by category' })
  }
}

const getPostBySlug = async (request, response) => {
  const { slug } = request.params
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { categories: true },
    })

    if (!post || post.status !== 'ACTIVE') {
      return response.status(404).json({ message: 'Post not found' })
    }

    const likeCount = await prisma.likes.count({
      where: { postId: post.id },
    })

    response.status(200).json({ ...post, likeCount })
  } catch (error) {
    console.error('Error fetching post:', error)
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

const likePost = async (request, response) => {
  const { token, postId } = request.body

  if (!token) {
    return response.status(400).json({ message: 'Please login first' })
  }

  const user = jwt.verify(token, process.env.JWT_SECRET)
  console.log(user)
  try {
    if (!postId) {
      return response.status(400).json({ message: 'Post data is required' })
    }

    if (!user) {
      return response.status(400).json({ message: 'Invalid user data' })
    }

    const isExist = await prisma.likes.findFirst({
      where: {
        userId: user?.userId,
        postId,
      },
    })

    if (isExist) {
      return response
        .status(400)
        .json({ message: 'You have already liked this post' })
    }

    await prisma.likes.create({
      data: {
        userId: user?.userId,
        postId: postId,
      },
    })

    return response.status(200).json({ message: 'You have liked the post' })
  } catch (error) {
    console.log(error)
    response.status(500).json({ message: 'Something went wrong' })
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
  getMostLikedPosts,
  getPostById,
  getAllPostsCategoryWise,
  getPostByCategory,
  getPostBySlug,
  getPostBySearchQuery,
  createPost,
  updatePost,
  likePost,
  activePost,
  inactivePost,
  deletePost,
}
