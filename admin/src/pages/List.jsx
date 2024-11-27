import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({token}) => {
  const [list, setList] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchList();
  }, []);

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

  // Menú de acciones desplegable
  const ActionMenu = ({ product }) => (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1">
        <button
          onClick={() => {
            navigate(`/edit/${product._id}`);
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
      <p className='text-2xl font-bold mb-2'>Lista de productos</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_0.2fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Imagen</b>
          <b>Nombre</b>
          <b>Categoria</b>
          <b>Subcategoría</b>
          <b>Precio</b>
          <b className='text-center'>Acciones</b>
        </div>

        {list.map((item, index) => (
          <div key={index} className='grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_0.2fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
            <img src={item.images[0]} alt={item.name} className='w-16' />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.subCategory}</p>
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

      {showDeleteModal && <DeleteConfirmationModal />}
    </>
  )
}

export default List