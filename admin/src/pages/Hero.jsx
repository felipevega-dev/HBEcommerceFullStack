import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

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
  const [editingSlide, setEditingSlide] = useState(null)

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

  const handleEdit = (slide) => {
    setEditingSlide({
      id: slide._id,
      title: slide.title,
      subtitle: slide.subtitle
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/hero-slides/${editingSlide.id}`,
        {
          title: editingSlide.title,
          subtitle: editingSlide.subtitle
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Slide actualizado correctamente');
        setEditingSlide(null);
        fetchSlides();
      }
    } catch (error) {
      console.error('Error al actualizar slide:', error);
      toast.error('Error al actualizar el slide');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar orden localmente
    setSlides(items);

    // Enviar nuevo orden al servidor
    try {
      await axios.put(
        `${backendUrl}/api/hero-slides/reorder`,
        {
          slides: items.map((slide, index) => ({
            id: slide._id,
            order: index
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error al reordenar slides:', error);
      toast.error('Error al actualizar el orden');
      fetchSlides(); // Recargar orden original en caso de error
    }
  };

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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {slides.map((slide, index) => (
                    <Draggable
                      key={slide._id}
                      draggableId={slide._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-48 h-32 object-cover rounded"
                            />
                            <div className="flex-grow">
                              {editingSlide?.id === slide._id ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editingSlide.title}
                                    onChange={(e) => setEditingSlide(prev => ({
                                      ...prev,
                                      title: e.target.value
                                    }))}
                                    className="w-full p-2 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={editingSlide.subtitle}
                                    onChange={(e) => setEditingSlide(prev => ({
                                      ...prev,
                                      subtitle: e.target.value
                                    }))}
                                    className="w-full p-2 border rounded"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleSaveEdit}
                                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={() => setEditingSlide(null)}
                                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h3 className="font-semibold">{slide.title}</h3>
                                  <p className="text-gray-600">{slide.subtitle}</p>
                                  <p className="text-sm text-gray-500">
                                    Producto: {slide.productId?.name || 'No disponible'}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleEdit(slide)}
                                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDelete(slide._id)}
                                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="text-gray-400 cursor-move">
                              ⋮⋮
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}

export default Hero