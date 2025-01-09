const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authenticateJWT = (request, response, next) => {
  const token = request.headers['authorization']?.split(' ')[1]
  console.log(request.headers)

  if (!token) return response.status(403).json({ message: 'Access denied' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp < currentTime) {
      return response.status(401).json({ message: 'Token has expired' })
    }

    request.user = decoded
    next()
  } catch (error) {
    return response.status(403).json({ message: 'Invalid token' })
  }
}

module.exports = authenticateJWT
