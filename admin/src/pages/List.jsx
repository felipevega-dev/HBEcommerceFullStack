import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify';

const List = ({token}) => {

  const [list, setList] = useState([]);
  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products);
      }else{
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error al obtener la lista de productos');
    }
  }

  const removeProduct = async (id) => {
    try {
      console.log('Token recibido en List:', token);
      console.log('ID a eliminar:', id);
      const response = await axios.delete(backendUrl + '/api/product/remove', {
        data: { id },
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
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
        {
          list.map((item, index) => (
            <div key={index} className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
              <img src={item.images[0]} alt={item.name} className='w-12' />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p className='text-right md:text-center cursor-pointer text-lg' onClick={() => removeProduct(item._id)}>Acciones</p>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default List