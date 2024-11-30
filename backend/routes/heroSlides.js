import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import ProductModel from '../models/productModel.js';

const router = express.Router();

// Obtener todos los slides
router.get('/', async (req, res) => {
  try {
    console.log('Recibida petición GET para slides');
    
    const slides = await HeroSlide.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'productId',
        model: 'product',
        select: 'name images _id price'
      });
    
    console.log('Slides encontrados:', slides);
    
    res.json({ 
      success: true, 
      slides: slides || []
    });
    
  } catch (error) {
    console.error('Error al obtener slides:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Añadir nuevo slide
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, productId, image } = req.body;
    console.log('Datos recibidos:', { title, subtitle, productId, image }); // Para debug

    // Verificar que el producto existe
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(400).json({ 
        success: false, 
        error: 'El producto seleccionado no existe' 
      });
    }

    const slide = new HeroSlide({
      title,
      subtitle,
      productId,
      image
    });

    const savedSlide = await slide.save();
    const populatedSlide = await HeroSlide.findById(savedSlide._id)
      .populate('productId', 'name images _id');

    res.json({ 
      success: true, 
      slide: populatedSlide,
      message: 'Slide creado exitosamente'
    });

  } catch (error) {
    console.error('Error al crear slide:', error); // Para debug
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Eliminar slide
router.delete('/:id', async (req, res) => {
  try {
    const result = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Slide no encontrado' 
      });
    }
    res.json({ success: true, message: 'Slide eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar slide:', error); // Para debug
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 