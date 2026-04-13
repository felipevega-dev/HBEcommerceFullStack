import {
  createProductService,
  listProductsService,
  getSingleProductService,
  removeProductService,
  updateProductService,
  getCategoriesService,
} from '../services/productService.js'
import { logAction } from '../services/auditLogService.js'

const addProduct = async (req, res, next) => {
  try {
    // Collect uploaded file paths (multer stores them locally)
    const imageFiles = []
    ;['image1', 'image2', 'image3', 'image4'].forEach((fieldName) => {
      if (req.files?.[fieldName]) imageFiles.push(req.files[fieldName][0].path)
    })

    const product = await createProductService(req.body, imageFiles)
    await logAction(
      req.user?.adminId || req.user?.id,
      'CREATE',
      'product',
      product._id.toString(),
      { name: product.name },
      req,
    )
    res.json({ success: true, message: 'Producto creado exitosamente', product })
  } catch (error) {
    next(error)
  }
}

const listProducts = async (req, res, next) => {
  try {
    const { page, limit } = req.query
    const result = await listProductsService({ page, limit })
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}

const removeProduct = async (req, res, next) => {
  try {
    await removeProductService(req.body.id)
    await logAction(req.user?.adminId || req.user?.id, 'DELETE', 'product', req.body.id, null, req)
    res.json({ success: true, message: 'Producto eliminado' })
  } catch (error) {
    next(error)
  }
}

const singleProduct = async (req, res, next) => {
  try {
    const product = await getSingleProductService(req.params.id)
    res.json({ success: true, product })
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const newImageFiles = []
    ;['image1', 'image2', 'image3', 'image4'].forEach((fieldName) => {
      if (req.files?.[fieldName]) newImageFiles.push(req.files[fieldName][0].path)
    })

    const product = await updateProductService(req.body.id, req.body, newImageFiles)
    await logAction(
      req.user?.adminId || req.user?.id,
      'UPDATE',
      'product',
      req.body.id,
      { name: product.name },
      req,
    )
    res.json({ success: true, message: 'Producto actualizado exitosamente', product })
  } catch (error) {
    next(error)
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await getCategoriesService()
    res.json({ success: true, categories })
  } catch (error) {
    next(error)
  }
}

export { addProduct, listProducts, removeProduct, singleProduct, updateProduct, getCategories }
