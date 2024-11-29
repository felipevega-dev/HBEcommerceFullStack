import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { StrictMode } from 'react';

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
    color: '',
    sizes: [],
    bestseller: false,
    currentImages: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);

  const colorMap = {
    'Negro': '#000000',
    'Blanco': '#FFFFFF',
    'Gris': '#808080',
    'Rojo': '#FF0000',
    'Azul': '#0000FF',
    'Verde': '#008000',
    'Amarillo': '#FFFF00',
    'Rosa': '#FFC0CB',
    'Morado': '#800080',
    'Naranja': '#FFA500',
    'Marrón': '#8B4513',
    'Beige': '#F5F5DC'
  };

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
        setSelectedColors(product.colors || []);
      }
    } catch (error) {
      toast.error('Error al cargar el producto');
      navigate('/list');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/category`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedColors.length === 0) {
        toast.error('Por favor selecciona al menos un color');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('id', id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('colors', JSON.stringify(selectedColors));
      formDataToSend.append('bestseller', formData.bestseller);
      formDataToSend.append('sizes', JSON.stringify(formData.sizes));
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
    
    const items = Array.from(formData.currentImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFormData(prev => ({
      ...prev,
      currentImages: items
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      if (!categories.includes(newCategory.trim())) {
        setCategories(prev => [...prev, newCategory.trim()]);
        setFormData(prev => ({...prev, category: newCategory.trim()}));
      }
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleAddNewSubcategory = async () => {
    if (!newSubcategory.trim() || !formData.category) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/subcategory/add`,
        {
          categoryName: formData.category,
          subcategoryName: newSubcategory
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories(categories.map(cat => 
          cat.name === formData.category 
            ? response.data.category 
            : cat
        ));
        setFormData(prev => ({...prev, subcategory: newSubcategory}));
        setNewSubcategory('');
        setShowNewSubcategoryInput(false);
        toast.success('Subcategoría añadida exitosamente');
      }
    } catch (error) {
      toast.error('Error al añadir subcategoría');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchCategories();
      await fetchProduct();
    };
    initialize();
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            {!showNewCategoryInput ? (
              <div className="flex gap-2">
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="px-3 py-2 bg-black text-white rounded"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nueva categoría"
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-2 bg-green-600 text-white rounded"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategory('');
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Subcategoría</label>
            {!showNewSubcategoryInput ? (
              <div className="flex gap-2">
                <select 
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Selecciona una subcategoría</option>
                  {categories
                    .find(cat => cat.name === formData.category)
                    ?.subcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubcategoryInput(true)}
                  className="px-3 py-2 bg-black text-white rounded"
                  disabled={!formData.category}
                >
                  +
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="Nueva subcategoría"
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={handleAddNewSubcategory}
                  className="px-3 py-2 bg-green-600 text-white rounded"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSubcategoryInput(false);
                    setNewSubcategory('');
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded"
                >
                  ×
                </button>
              </div>
            )}
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

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Imágenes actuales (arrastra para reordenar)
          </label>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 flex-wrap"
                >
                  {formData.currentImages.map((image, index) => (
                    <Draggable
                      key={image}
                      draggableId={image}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative ${snapshot.isDragging ? 'z-10' : ''}`}
                        >
                          <div className="relative group">
                            <img
                              src={image}
                              alt={`Imagen ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg">
                              <div className="absolute top-2 left-2 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                                {index === 0 ? 'Principal' : `${index + 1}º`}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.currentImages.filter((_, i) => i !== index);
                                setFormData(prev => ({
                                  ...prev,
                                  currentImages: newImages
                                }));
                              }}
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
              <div key={index} className="relative">
                <input
                  type="file"
                  ref={ref}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {imagePreviews[index] && (
                  <div className="mt-2 relative">
                    <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-xs py-1 px-2 text-center rounded-t">
                      Vista previa
                    </div>
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-contain bg-gray-50 rounded-b border-t-0 border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        ref.current.value = '';
                        setImagePreviews(prev => {
                          const newPreviews = [...prev];
                          newPreviews[index] = null;
                          return newPreviews;
                        });
                      }}
                      className="absolute top-8 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Colores</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Object.keys(colorMap).map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => {
                  setSelectedColors(prev => 
                    prev.includes(colorOption)
                      ? prev.filter(c => c !== colorOption)
                      : [...prev, colorOption]
                  );
                }}
                className={`px-4 py-2 rounded-md transition-all`}
                style={{
                  backgroundColor: selectedColors.includes(colorOption) ? colorMap[colorOption] : 'white',
                  color: selectedColors.includes(colorOption) ? 
                    ['Blanco', 'Amarillo', 'Beige'].includes(colorOption) ? 'black' : 'white' 
                    : 'black',
                  border: selectedColors.includes(colorOption) && colorOption === 'Blanco' 
                    ? '2px solid black'
                    : '1px solid #e5e7eb'
                }}
              >
                {colorOption}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Colores seleccionados: {selectedColors.join(', ')}</p>
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