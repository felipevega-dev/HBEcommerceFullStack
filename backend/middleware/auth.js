import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        // Log detallado de headers
        console.log('=== Debug Auth Middleware ===');
        console.log('Headers completos:', JSON.stringify(req.headers, null, 2));
        console.log('Authorization header:', req.headers.authorization);
        
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('❌ No se encontró token en el header');
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        console.log('Token extraído:', token.substring(0, 20) + '...');
        console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verificado exitosamente');
            console.log('Datos del token:', {
                userId: decoded.id,
                iat: new Date(decoded.iat * 1000).toISOString(),
                exp: new Date(decoded.exp * 1000).toISOString()
            });
            
            req.user = decoded;
            console.log('=== Fin Debug Auth ===\n');
            next();
        } catch (error) {
            console.log('❌ Error al verificar token:', {
                name: error.name,
                message: error.message,
                expiredAt: error.expiredAt
            });
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'Token verification failed'
            });
        }
    } catch (error) {
        console.log('❌ Error general en auth middleware:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            message: 'Server error in auth middleware'
        });
    }
};

export default authUser;
