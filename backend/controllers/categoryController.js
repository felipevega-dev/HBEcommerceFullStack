import CategoryModel from '../models/categoryModel.js'

const getCategories = async (_req, res) => {
  try {
    const categories = await CategoryModel.find()
    res.json({
      success: true,
      categories,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorias',
    })
  }
}

const addCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body

    const existingCategory = await CategoryModel.findOne({ name })
    if (existingCategory) {
      const updatedCategory = await CategoryModel.findOneAndUpdate(
        { name },
        {
          $addToSet: {
            subcategories: {
              $each: subcategories,
            },
          },
        },
        { new: true },
      )

      return res.json({
        success: true,
        category: updatedCategory,
      })
    }

    const newCategory = new CategoryModel({
      name,
      subcategories,
    })
    await newCategory.save()

    res.json({
      success: true,
      category: newCategory,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error al anadir categoria',
    })
  }
}

const addSubcategory = async (req, res) => {
  try {
    const { categoryName, subcategoryName } = req.body

    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { name: categoryName },
      { $addToSet: { subcategories: subcategoryName } },
      { new: true },
    )

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada',
      })
    }

    res.json({
      success: true,
      category: updatedCategory,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Error al anadir subcategoria',
    })
  }
}

export { getCategories, addCategory, addSubcategory }
