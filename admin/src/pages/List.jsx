import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { backendUrl, currency } from '../App'

const DeleteConfirmationModal = ({ product, onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
      <p className="mb-4">
        ¿Estás seguro de que deseas eliminar el producto <strong>"{product?.name}"</strong>?
      </p>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)

const ActionMenu = ({ product, onEdit, onDelete }) => (
  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
    <div className="py-1">
      <button
        onClick={() => onEdit(product)}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(product)}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        Eliminar
      </button>
    </div>
  </div>
)

const SkeletonRow = () => (
  <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_0.2fr] items-center py-2 px-2 border bg-white animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded" />
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-6 bg-gray-200 rounded-full w-16" />
    <div className="h-4 bg-gray-200 rounded w-8 mx-auto" />
  </div>
)

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showActionMenu, setShowActionMenu] = useState(null)
  const navigate = useNavigate()

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`)
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Error al obtener la lista de productos')
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/api/product/remove`, {
        data: { id: selectedProduct._id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
        setShowDeleteModal(false)
        setSelectedProduct(null)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Error al eliminar el producto')
    }
  }

  const handleEdit = (product) => {
    navigate(`/edit/${product._id}`)
    setShowActionMenu(null)
  }

  const handleDeleteClick = (product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
    setShowActionMenu(null)
  }

  useEffect(() => {
    fetchList()
  }, [])

  // Categorías únicas para el filtro
  const uniqueCategories = [...new Set(list.map((item) => item.category).filter(Boolean))]

  // Productos filtrados
  const filteredList = list.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <p className="text-2xl font-bold mb-4">Lista de productos</p>

      {/* Buscador y filtro */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full sm:max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a0a0]"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a0a0]"
        >
          <option value="">Todas las categorías</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {/* Encabezado */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_0.2fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Imagen</b>
          <b>Nombre</b>
          <b>Categoría</b>
          <b>Subcategoría</b>
          <b>Precio</b>
          <b>Estado</b>
          <b className="text-center">Acciones</b>
        </div>

        {/* Skeleton de carga */}
        {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* Lista de productos */}
        {!loading &&
          filteredList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_0.2fr] items-center py-1 px-2 border bg-white text-sm"
            >
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{item.subCategory}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    item.active !== false
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.active !== false ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="text-right md:text-center relative">
                <button
                  onClick={() => setShowActionMenu(showActionMenu === item._id ? null : item._id)}
                  className="text-gray-600 hover:text-gray-800 text-xl cursor-pointer"
                >
                  ...
                </button>
                {showActionMenu === item._id && (
                  <ActionMenu product={item} onEdit={handleEdit} onDelete={handleDeleteClick} />
                )}
              </div>
            </div>
          ))}

        {/* Sin resultados */}
        {!loading && filteredList.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No se encontraron productos con los filtros aplicados.
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onCancel={() => {
            setShowDeleteModal(false)
            setSelectedProduct(null)
          }}
          onConfirm={removeProduct}
        />
      )}
    </>
  )
}

export default List
