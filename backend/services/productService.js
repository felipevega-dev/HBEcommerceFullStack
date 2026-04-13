import productModel from '../models/productModel.js'
import categoryModel from '../models/categoryModel.js'
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js'

export const ensureCategoryExists = async (category, subcategory) => {
  const categoryDoc = await categoryModel.findOne({ name: category })
  if (!categoryDoc) {
    await categoryModel.create({ name: category, subcategories: [subcategory] })
  } else if (!categoryDoc.subcategories.includes(subcategory)) {
    await categoryModel.findOneAndUpdate(
      { name: category },
      { $addToSet: { subcategories: subcategory } },
    )
  }
}

export const createProductService = async (data, imageFiles) => {
  const { name, description, price, category, subcategory, color, sizes, bestseller } = data

  if (!imageFiles || imageFiles.length === 0)
    throw new ValidationError('Se requiere al menos una imagen')
  if (imageFiles.length > 4) throw new ValidationError('No se pueden subir más de 4 imágenes')

  await ensureCategoryExists(category, subcategory)

  const productData = {
    name,
    description,
    category,
    price: Number(price),
    subCategory: subcategory,
    color,
    bestSeller: bestseller === 'true',
    sizes: JSON.parse(sizes),
    images: imageFiles, // URLs already resolved by controller
    date: Date.now(),
  }

  const product = new productModel(productData)
  await product.save()
  return product
}

export const listProductsService = async ({ page, limit } = {}) => {
  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit)
    const [products, total] = await Promise.all([
      productModel.find().skip(skip).limit(Number(limit)),
      productModel.countDocuments(),
    ])
    return {
      products,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    }
  }
  const products = await productModel.find()
  return { products }
}

export const getSingleProductService = async (id) => {
  const product = await productModel.findById(id)
  if (!product) throw new NotFoundError('Producto no encontrado')
  return product
}

export const removeProductService = async (id) => {
  const product = await productModel.findByIdAndDelete(id)
  if (!product) throw new NotFoundError('Producto no encontrado')
  return product
}

export const updateProductService = async (id, data, newImageFiles) => {
  const {
    name,
    description,
    price,
    category,
    subcategory,
    colors,
    sizes,
    bestseller,
    currentImages,
  } = data

  await ensureCategoryExists(category, subcategory)

  let imagesUrl = currentImages ? JSON.parse(currentImages) : []
  if (newImageFiles && newImageFiles.length > 0) {
    imagesUrl = [...imagesUrl, ...newImageFiles]
  }

  const productData = {
    name,
    description,
    category,
    price: Number(price),
    subCategory: subcategory,
    colors: JSON.parse(colors),
    bestSeller: bestseller === 'true',
    sizes: JSON.parse(sizes),
    images: imagesUrl,
  }

  const updated = await productModel.findByIdAndUpdate(id, productData, { new: true })
  if (!updated) throw new NotFoundError('Producto no encontrado')
  return updated
}

export const getCategoriesService = async () => {
  return categoryModel.find()
}
