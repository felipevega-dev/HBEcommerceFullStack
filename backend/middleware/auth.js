import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired' })
      }
      return res.status(401).json({ success: false, message: 'Token verification failed' })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error in auth middleware' })
  }
}

export default authUser
