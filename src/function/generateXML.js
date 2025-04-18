const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Helper to escape XML
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function generateRssXml() {
  const baseUrl = 'https://clothes2wear.com'

  const posts = await prisma.post.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      categories: true,
      tags: true,
    },
    take: 20,
  })

  const itemsXml = posts
    .map((post) => {
      const title = escapeXml(post.title)
      const link = `${baseUrl}/blogs/${post.slug}`
      const description = escapeXml(post.thumbnailImageAltText || '')
      const categories = post.categories
        .map((cat) => `<category>${escapeXml(cat.name)}</category>`)
        .join('')
      const tags = post.tags
        .map((tag) => `<category>${escapeXml(tag.name)}</category>`)
        .join('')

      return `
      <item>
        <title>${title}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${post.createdAt.toUTCString()}</pubDate>
        <description>${description}</description>
        ${categories}
        ${tags}
      </item>
    `
    })
    .join('')

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Clothes2Wear Blog</title>
    <link>${baseUrl}</link>
    <description>Latest fashion insights and blogs from Clothes2Wear</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`

  const filePath = path.join(__dirname, 'rss.xml')
  fs.writeFileSync(filePath, rssXml, 'utf8')

  console.log('✅ RSS feed generated and saved as rss.xml')
  process.exit(0)
}

generateRssXml().catch((err) => {
  console.error('❌ Failed to generate RSS:', err)
  process.exit(1)
})
