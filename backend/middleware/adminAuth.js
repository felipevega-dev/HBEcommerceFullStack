import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
    try {
        const token = req.headers
       if (!token) {
        return res.json({success: false, message: 'Token no proporcionado'});
       }
       const token_decode = jwt.verify(token, process.env.JWT_SECRET);
       if (token_decode.email !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
        return res.json({success: false, message: 'Acceso no autorizado'});
       }
       next();
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }   
}

export default adminAuth;