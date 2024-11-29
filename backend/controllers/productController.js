import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';
import cloudinary from 'cloudinary';

// Configurar cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// Funcion para añadir un producto
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subcategory, color, sizes, bestseller } = req.body;
        
        // Verificar si la categoría existe
        const categoryDoc = await categoryModel.findOne({ name: category });
        if (!categoryDoc) {
            // Si no existe, crear nueva categoría con la subcategoría
            await categoryModel.create({
                name: category,
                subcategories: [subcategory]
            });
        } else if (!categoryDoc.subcategories.includes(subcategory)) {
            // Si existe pero no tiene la subcategoría, añadirla
            await categoryModel.findOneAndUpdate(
                { name: category },
                { $addToSet: { subcategories: subcategory } }
            );
        }

        // Recolectar todas las imágenes disponibles
        const imageFiles = [];
        ['image1', 'image2', 'image3', 'image4'].forEach(fieldName => {
            if (req.files && req.files[fieldName]) {
                imageFiles.push(req.files[fieldName][0]);
            }
        });

        if (imageFiles.length === 0) {
            return res.json({ success: false, message: 'Se requiere al menos una imagen' });
        }

        if (imageFiles.length > 4) {
            return res.json({ success: false, message: 'No se pueden subir más de 4 imágenes' });
        }

        // Subir todas las imágenes a Cloudinary
        const imagesUrl = await Promise.all(
            imageFiles.map(async (file) => {
                const result = await cloudinary.v2.uploader.upload(file.path, {
                    resource_type: 'image',
                });
                return result.secure_url;
            })
        );

        const productData = {
            name, 
            description, 
            category, 
            price: Number(price), 
            subCategory: subcategory, 
            color, 
            bestSeller: bestseller === 'true' ? true : false, 
            sizes: JSON.parse(sizes), 
            images: imagesUrl, // Array de URLs de imágenes
            date: Date.now()
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ 
            success: true, 
            message: 'Producto creado exitosamente', 
            product
        });
    } catch (error) {
        console.log('Error al crear producto:', error);
        res.json({ success: false, message: error.message });
    }
}

const listProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);
        if (!product) {
            return res.json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subcategory, colors, sizes, bestseller, currentImages } = req.body;
        
        // Verificar si la categoría y subcategoría existen o crearlas
        const categoryDoc = await categoryModel.findOne({ name: category });
        if (!categoryDoc) {
            await categoryModel.create({
                name: category,
                subcategories: [subcategory]
            });
        } else if (!categoryDoc.subcategories.includes(subcategory)) {
            await categoryModel.findOneAndUpdate(
                { name: category },
                { $addToSet: { subcategories: subcategory } }
            );
        }

        let imagesUrl = currentImages ? JSON.parse(currentImages) : [];

        // Procesar nuevas imágenes si se proporcionan
        if (req.files) {
            const imageFiles = [];
            ['image1', 'image2', 'image3', 'image4'].forEach(fieldName => {
                if (req.files[fieldName]) {
                    imageFiles.push(req.files[fieldName][0]);
                }
            });

            const newImagesUrl = await Promise.all(
                imageFiles.map(async (file) => {
                    const result = await cloudinary.v2.uploader.upload(file.path, {
                        resource_type: 'image',
                    });
                    return result.secure_url;
                })
            );

            imagesUrl = [...imagesUrl, ...newImagesUrl];
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory: subcategory,
            colors: JSON.parse(colors), // Parsear el array de colores
            bestSeller: bestseller === 'true',
            sizes: JSON.parse(sizes),
            images: imagesUrl
        };

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            productData,
            { new: true }
        );

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            product: updatedProduct
        });
    } catch (error) {
        console.log('Error al actualizar producto:', error);
        res.json({ success: false, message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.json({ 
            success: true, 
            categories
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addProduct, listProducts, removeProduct, singleProduct, updateProduct, getCategories };
