import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify';

const List = ({token}) => {
  const [list, setList] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null); // Para el ID del producto actual
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    sizes: [],
    bestseller: false,
    currentImages: []
  });
  const fileInputRefs = [useRef(), useRef(), useRef(), useRef()];

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error al obtener la lista de productos');
    }
  }

  const removeProduct = async () => {
    try {
      const response = await axios.delete(backendUrl + '/api/product/remove', {
        data: { id: selectedProduct._id },
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
        setShowDeleteModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Error al eliminar el producto');
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('id', selectedProduct._id);
      formData.append('name', editFormData.name);
      formData.append('description', editFormData.description);
      formData.append('price', editFormData.price);
      formData.append('category', editFormData.category);
      formData.append('subcategory', editFormData.subcategory);
      formData.append('sizes', JSON.stringify(editFormData.sizes));
      formData.append('bestseller', editFormData.bestseller);
      formData.append('currentImages', JSON.stringify(editFormData.currentImages));

      fileInputRefs.forEach((ref, index) => {
        if (ref.current?.files[0]) {
          formData.append(`image${index + 1}`, ref.current.files[0]);
        }
      });

      const response = await axios.put(
        `${backendUrl}/api/product/update`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setShowEditModal(false);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el producto');
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setEditFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        category: selectedProduct.category,
        subcategory: selectedProduct.subCategory,
        sizes: selectedProduct.sizes,
        bestseller: selectedProduct.bestSeller,
        currentImages: selectedProduct.images
      });
    }
  }, [selectedProduct]);

  // Modal de confirmación de eliminación
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
        <p className="mb-4">¿Estás seguro de que deseas eliminar el producto "{selectedProduct?.name}"?</p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button 
            onClick={removeProduct}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de edición
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Editar Producto</h3>
          <button 
            onClick={() => setShowEditModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                value={editFormData.price}
                onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <input
                type="text"
                value={editFormData.category}
                onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subcategoría</label>
              <input
                type="text"
                value={editFormData.subcategory}
                onChange={(e) => setEditFormData({...editFormData, subcategory: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <p className='text-lg font-medium'>Tallas Disponibles</p>
            <div className='flex gap-3'>
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <div 
                  key={size}
                  onClick={() => setEditFormData(prev => ({
                    ...prev,
                    sizes: prev.sizes.includes(size) 
                      ? prev.sizes.filter(s => s !== size)
                      : [...prev.sizes, size]
                  }))}
                  className='cursor-pointer'
                >
                  <p className={`${
                    editFormData.sizes.includes(size) ? 'bg-pink-100' : 'bg-slate-100'
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
              checked={editFormData.bestseller}
              onChange={(e) => setEditFormData({...editFormData, bestseller: e.target.checked})}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Best Seller</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes actuales</label>
            <div className="grid grid-cols-4 gap-4">
              {editFormData.currentImages.map((img, index) => (
                <div key={index} className="relative">
                  <img src={img} alt={`Producto ${index + 1}`} className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setEditFormData({
                      ...editFormData,
                      currentImages: editFormData.currentImages.filter((_, i) => i !== index)
                    })}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
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
    </div>
  );

  // Menú de acciones desplegable
  const ActionMenu = ({ product }) => (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1">
        <button
          onClick={() => {
            setSelectedProduct(product);
            setShowEditModal(true);
            setShowActionMenu(null);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Editar
        </button>
        <button
          onClick={() => {
            setSelectedProduct(product);
            setShowDeleteModal(true);
            setShowActionMenu(null);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <p className='text-2xl font-bold'>Lista de productos</p>
      <div className='flex flex-col gap-2'>
        {/* Product Card */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Imagen</b>
          <b>Nombre</b>
          <b>Categoria</b>
          <b>Precio</b>
          <b className='text-center'>Acciones</b>
        </div>

        {/* Product List */}
        {list.map((item, index) => (
          <div key={index} className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
            <img src={item.images[0]} alt={item.name} className='w-12' />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            <div className='text-right md:text-center relative'>
              <button
                onClick={() => setShowActionMenu(showActionMenu === item._id ? null : item._id)}
                className='text-gray-600 hover:text-gray-800 text-xl cursor-pointer'
              >
                ⋮
              </button>
              {showActionMenu === item._id && <ActionMenu product={item} />}
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {showDeleteModal && <DeleteConfirmationModal />}
      {showEditModal && <EditModal />}
    </>
  )
}

export default List