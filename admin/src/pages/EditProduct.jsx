import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EditProduct = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const fileInputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    sizes: [],
    bestseller: false,
    currentImages: []
  });

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/single/${id}`);
      if (response.data.success) {
        const product = response.data.product;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          subcategory: product.subCategory,
          sizes: product.sizes,
          bestseller: product.bestSeller,
          currentImages: product.images
        });
      }
    } catch (error) {
      toast.error('Error al cargar el producto');
      navigate('/list');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
        setSubcategories(response.data.subcategories);
      }
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
      formDataToSend.append('bestseller', formData.bestseller);
      formDataToSend.append('currentImages', JSON.stringify(formData.currentImages));

      fileInputRefs.forEach((ref, index) => {
        if (ref.current?.files[0]) {
          formDataToSend.append(`image${index + 1}`, ref.current.files[0]);
        }
      });

      const response = await axios.put(
        `${backendUrl}/api/product/update`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Producto actualizado exitosamente');
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Error al actualizar el producto');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newImages = Array.from(formData.currentImages);
    const [reorderedItem] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, reorderedItem);
    
    setFormData(prev => ({
      ...prev,
      currentImages: newImages
    }));
  };

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Producto</h1>
        <button
          onClick={() => navigate('/list')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subcategoría</label>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({...prev, subcategory: e.target.value}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Selecciona una subcategoría</option>
              {subcategories.map((subcat, index) => (
                <option key={index} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium">Tallas Disponibles</p>
          <div className="flex gap-3">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <div 
                key={size}
                onClick={() => setFormData(prev => ({
                  ...prev,
                  sizes: prev.sizes.includes(size) 
                    ? prev.sizes.filter(s => s !== size)
                    : [...prev.sizes, size]
                }))}
                className="cursor-pointer"
              >
                <p className={`${
                  formData.sizes.includes(size) ? 'bg-pink-100' : 'bg-slate-100'
                } px-3 py-1`}>
                  {size}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.bestseller}
            onChange={(e) => setFormData(prev => ({...prev, bestseller: e.target.checked}))}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Best Seller</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes actuales (arrastra para reordenar)
          </label>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {formData.currentImages.map((img, index) => (
                    <Draggable 
                      key={img} 
                      draggableId={img} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative ${
                            snapshot.isDragging ? 'z-50' : ''
                          }`}
                        >
                          <div className="relative group">
                            <img 
                              src={img} 
                              alt={`Producto ${index + 1}`} 
                              className="w-full h-24 object-cover rounded"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200">
                              <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                                {index === 0 ? 'Principal' : `${index + 1}º`}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                currentImages: prev.currentImages.filter((_, i) => i !== index)
                              }))}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              ×
                            </button>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agregar nuevas imágenes</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fileInputRefs.map((ref, index) => (
              <div key={index}>
                <input
                  type="file"
                  ref={ref}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/list')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct; 