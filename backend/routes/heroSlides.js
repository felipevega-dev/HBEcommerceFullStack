import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import ProductModel from '../models/productModel.js';

const router = express.Router();

// Obtener todos los slides ordenados
router.get('/', async (req, res) => {
  try {
    console.log('Recibida petición GET para slides');
    
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: -1 })
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

// Actualizar slide
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const slideId = req.params.id;

    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      slideId,
      { title, subtitle },
      { new: true }
    ).populate('productId', 'name images _id price');

    if (!updatedSlide) {
      return res.status(404).json({
        success: false,
        error: 'Slide no encontrado'
      });
    }

    res.json({
      success: true,
      slide: updatedSlide,
      message: 'Slide actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar slide:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Actualizar orden de slides
router.put('/reorder', async (req, res) => {
  try {
    const { slides } = req.body; // Array de { id, order }
    
    // Actualizar el orden de cada slide
    await Promise.all(
      slides.map(({ id, order }) => 
        HeroSlide.findByIdAndUpdate(id, { order })
      )
    );

    const updatedSlides = await HeroSlide.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('productId', 'name images _id price');

    res.json({
      success: true,
      slides: updatedSlides,
      message: 'Orden actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al reordenar slides:', error);
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