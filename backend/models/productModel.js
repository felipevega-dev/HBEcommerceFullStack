import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: {
    type: [String], // Array de strings para las URLs de las imágenes
    required: true,
    validate: {
      validator: function (v) {
        return v.length > 0 && v.length <= 4 // Validar que tenga entre 1 y 4 imágenes
      },
      message: 'Debe tener entre 1 y 4 imágenes',
    },
  },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  colors: { type: [String], required: true },
  sizes: { type: Array, required: true },
  bestSeller: { type: Boolean },
  date: { type: Number, required: true },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
})

const ProductModel = mongoose.model('product', productSchema)

// Índices para queries frecuentes
productSchema.index({ category: 1, subCategory: 1 })
productSchema.index({ bestSeller: 1 })
productSchema.index({ date: -1 })
productSchema.index({ 'rating.average': -1 })

export default ProductModel
