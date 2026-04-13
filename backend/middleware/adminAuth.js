import jwt from 'jsonwebtoken'

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' })
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Formato de token inválido' })
    }

    const token = authHeader.split(' ')[1].trim()

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acceso no autorizado' })
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' })
    }
    return res.status(401).json({ success: false, message: 'Token inválido' })
  }
}

export default adminAuth
