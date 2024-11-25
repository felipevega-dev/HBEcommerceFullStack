import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.json({success: false, message: 'Token no proporcionado'});
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.json({success: false, message: 'Formato de token inválido'});
        }

        const token = authHeader.split(' ')[1].trim();
        
        if (!token) {
            return res.json({success: false, message: 'Token no proporcionado'});
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (token_decode.email !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({success: false, message: 'Acceso no autorizado'});
        }
        
        req.user = token_decode;
        next();
    } catch (error) {
        console.log('Error en autenticación:', error);
        res.json({success: false, message: error.message});
    }   
}

export default adminAuth;