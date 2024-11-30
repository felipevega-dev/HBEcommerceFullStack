import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'

const Hero = ({ token }) => {
  const [slides, setSlides] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    productId: '',
    image: ''
  })

  useEffect(() => {
    fetchSlides()
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await axios.get(`${backendUrl}/api/product/list`);
      
      console.log('Products response:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los productos');
    }
  };

  const fetchSlides = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching slides from admin...');
      const response = await axios.get(`${backendUrl}/api/hero-slides`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Slides response in admin:', response.data);
      
      if (response.data.success && response.data.slides) {
        setSlides(response.data.slides);
      } else {
        console.log('No slides found in admin response');
        setSlides([]);
      }
    } catch (error) {
      console.error('Error completo al obtener slides:', error.response || error);
      toast.error('Error al cargar los slides');
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value
    const selectedProduct = products.find(p => p._id === productId)
    if (selectedProduct) {
      setNewSlide(prev => ({
        ...prev,
        productId: selectedProduct._id,
        image: selectedProduct.images[0],
        title: selectedProduct.name,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await axios.post(`${backendUrl}/api/hero-slides`, {
        title: newSlide.title,
        subtitle: newSlide.subtitle,
        productId: newSlide.productId,
        image: newSlide.image
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Slide añadido correctamente')
        fetchSlides()
        setNewSlide({ title: '', subtitle: '', productId: '', image: '' })
        setSelectedProduct('')
      }
    } catch (error) {
      console.error('Error completo:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Error al añadir el slide')
    }
  }

  const handleDelete = async (slideId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este slide?')) {
      try {
        await axios.delete(`${backendUrl}/api/hero-slides/${slideId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Slide eliminado correctamente')
        fetchSlides()
      } catch (error) {
        console.error('Error deleting slide:', error)
        toast.error('Error al eliminar el slide')
      }
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestionar Hero Slides</h1>

      {/* Formulario para añadir nuevo slide */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Añadir Nuevo Slide</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seleccionar Producto</label>
            <select
              value={newSlide.productId}
              onChange={handleProductSelect}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona un producto</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Título del Slide</label>
            <input
              type="text"
              value={newSlide.title}
              onChange={(e) => setNewSlide(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subtítulo</label>
            <input
              type="text"
              value={newSlide.subtitle}
              onChange={(e) => setNewSlide(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {newSlide.image && (
            <div>
              <label className="block text-sm font-medium mb-1">Vista previa</label>
              <img
                src={newSlide.image}
                alt="Preview"
                className="w-full h-48 object-cover rounded"
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Añadir Slide
          </button>
        </div>
      </form>

      {/* Lista de slides existentes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Slides Actuales</h2>
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map((slide) => (
              <div key={slide._id} className="border rounded-lg p-4">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
                <h3 className="font-semibold">{slide.title}</h3>
                <p className="text-gray-600">{slide.subtitle}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Producto: {slide.productId?.name || 'No disponible'}
                </p>
                <button
                  onClick={() => handleDelete(slide._id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero