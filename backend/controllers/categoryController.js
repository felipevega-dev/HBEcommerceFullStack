import CategoryModel from '../models/categoryModel.js';

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find();
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías'
        });
    }
};

// Añadir nueva categoría
const addCategory = async (req, res) => {
    try {
        const { name, subcategories } = req.body;
        
        // Verificar si la categoría ya existe
        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
            // Si existe, actualizar subcategorías
            const updatedCategory = await CategoryModel.findOneAndUpdate(
                { name },
                { 
                    $addToSet: { 
                        subcategories: { 
                            $each: subcategories 
                        } 
                    } 
                },
                { new: true }
            );
            return res.json({
                success: true,
                category: updatedCategory
            });
        }

        // Si no existe, crear nueva
        const newCategory = new CategoryModel({
            name,
            subcategories
        });
        await newCategory.save();

        res.json({
            success: true,
            category: newCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al añadir categoría'
        });
    }
};

// Añadir subcategoría a una categoría existente
const addSubcategory = async (req, res) => {
    try {
        const { categoryName, subcategoryName } = req.body;
        
        const updatedCategory = await CategoryModel.findOneAndUpdate(
            { name: categoryName },
            { $addToSet: { subcategories: subcategoryName } },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.json({
            success: true,
            category: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al añadir subcategoría'
        });
    }
};

export { getCategories, addCategory, addSubcategory }; 