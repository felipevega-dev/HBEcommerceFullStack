import { v2 as cloudinary } from 'cloudinary';

const uploadImage = async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado ninguna imagen'
            });
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: 'profile-images',
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
            transformation: [
                { width: 400, height: 400, crop: "fill" }
            ]
        });

        res.json({
            success: true,
            url: result.secure_url
        });

    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen'
        });
    }
};

export { uploadImage }; 