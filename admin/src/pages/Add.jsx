import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a0a0] text-sm'

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
    <h3 className="text-base font-semibold text-gray-700 mb-4">{title}</h3>
    {children}
  </div>
)

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
  const [sizes, setSizes] = useState([])
  const [bestseller, setBestseller] = useState(false)

  const [categories, setCategories] = useState([])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newSubcategory, setNewSubcategory] = useState('')
  const [selectedColors, setSelectedColors] = useState([])

  const availableColors = [
    'Negro',
    'Blanco',
    'Gris',
    'Rojo',
    'Azul',
    'Verde',
    'Amarillo',
    'Rosa',
    'Morado',
    'Naranja',
    'Marrón',
    'Beige',
  ]

  const colorMap = {
    Negro: '#000000',
    Blanco: '#FFFFFF',
    Gris: '#808080',
    Rojo: '#FF0000',
    Azul: '#0000FF',
    Verde: '#008000',
    Amarillo: '#FFFF00',
    Rosa: '#FFC0CB',
    Morado: '#800080',
    Naranja: '#FFA500',
    Marrón: '#8B4513',
    Beige: '#F5F5DC',
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category`)
        if (response.data.success) {
          setCategories(response.data.categories)
          if (response.data.categories.length > 0) {
            setCategory(response.data.categories[0].name)
            if (response.data.categories[0].subcategories.length > 0) {
              setSubcategory(response.data.categories[0].subcategories[0])
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }

    fetchCategories()
  }, [backendUrl])

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/add`,
        {
          name: newCategory,
          subcategories: [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setCategories([...categories, response.data.category])
        setCategory(newCategory)
        setNewCategory('')
        setShowNewCategoryInput(false)
        toast.success('Categoría añadida exitosamente')
      }
    } catch (error) {
      toast.error('Error al añadir categoría')
    }
  }

  const handleAddNewSubcategory = async () => {
    if (!newSubcategory.trim() || !category) return

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/subcategory/add`,
        {
          categoryName: category,
          subcategoryName: newSubcategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setCategories(
          categories.map((cat) => (cat.name === category ? response.data.category : cat)),
        )
        setSubcategory(newSubcategory)
        setNewSubcategory('')
        setShowNewSubcategoryInput(false)
        toast.success('Subcategoría añadida exitosamente')
      }
    } catch (error) {
      toast.error('Error al añadir subcategoría')
    }
  }

  const resetForm = () => {
    setImage1(false)
    setImage2(false)
    setImage3(false)
    setImage4(false)
    setName('')
    setDescription('')
    setCategory('')
    setSubcategory('')
    setColor('')
    setPrice('')
    setSizes([])
    setBestseller(false)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      if (!image1) {
        toast.error('Se requiere al menos una imagen')
        return
      }

      if (sizes.length === 0) {
        toast.error('Selecciona al menos una talla')
        return
      }

      if (selectedColors.length === 0) {
        toast.error('Selecciona al menos un color')
        return
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subcategory', subcategory)
      formData.append('colors', JSON.stringify(selectedColors))
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes))

      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)

      const config = {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'multipart/form-data',
        },
      }

      toast.promise(axios.post(backendUrl + '/api/product/add', formData, config), {
        pending: 'Subiendo producto...',
        success: {
          render({ data }) {
            resetForm()
            return '¡Producto agregado exitosamente!'
          },
        },
        error: {
          render({ data }) {
            return `Error: ${data.response?.data?.message || 'Error al subir el producto'}`
          },
        },
      })
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Error al crear el producto')
    }
  }

  const makeDropHandlers = (setter) => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) setter(file)
    },
  })

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start">
      {/* Sección: Imágenes */}
      <SectionCard title="Imágenes">
        <div className="flex gap-3 flex-wrap">
          {[
            { id: 'image1', state: image1, setter: setImage1 },
            { id: 'image2', state: image2, setter: setImage2 },
            { id: 'image3', state: image3, setter: setImage3 },
            { id: 'image4', state: image4, setter: setImage4 },
          ].map(({ id, state, setter }) => (
            <label
              key={id}
              htmlFor={id}
              className="cursor-pointer border-2 border-dashed border-gray-200 rounded-lg p-1 hover:border-[#c9a0a0] transition-colors"
              {...makeDropHandlers(setter)}
            >
              <img
                className="w-20 h-20 object-cover rounded"
                src={!state ? assets.upload_area : URL.createObjectURL(state)}
                alt=""
              />
              <input onChange={(e) => setter(e.target.files[0])} type="file" id={id} hidden />
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Sección: Información básica */}
      <SectionCard title="Información básica">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre del producto
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className={inputClass}
              type="text"
              placeholder="Escribe el nombre del producto"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              className={inputClass}
              rows={4}
              placeholder="Escribe la descripción del producto"
              required
            />
          </div>
        </div>
      </SectionCard>

      {/* Sección: Categorización */}
      <SectionCard title="Categorización">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-600">Categoría principal</label>
            {!showNewCategoryInput ? (
              <div className="flex gap-2">
                <select
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  className={inputClass}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="px-3 py-2 bg-black text-white rounded-lg text-sm"
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
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false)
                    setNewCategory('')
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-600">Subcategoría</label>
            {!showNewSubcategoryInput ? (
              <div className="flex gap-2">
                <select
                  onChange={(e) => setSubcategory(e.target.value)}
                  value={subcategory}
                  className={inputClass}
                  required
                >
                  <option value="">Selecciona una subcategoría</option>
                  {categories
                    .find((cat) => cat.name === category)
                    ?.subcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubcategoryInput(true)}
                  className="px-3 py-2 bg-black text-white rounded-lg text-sm"
                  disabled={!category}
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
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddNewSubcategory}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSubcategoryInput(false)
                    setNewSubcategory('')
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Sección: Variantes */}
      <SectionCard title="Variantes">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Tallas disponibles
            </label>
            <div className="flex gap-2 flex-wrap">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <div
                  key={size}
                  onClick={() =>
                    setSizes((prev) =>
                      prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size],
                    )
                  }
                  className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    sizes.includes(size)
                      ? 'bg-[#c9a0a0] text-white border-[#c9a0a0]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#c9a0a0]'
                  }`}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Colores</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => {
                    setSelectedColors((prev) =>
                      prev.includes(colorOption)
                        ? prev.filter((c) => c !== colorOption)
                        : [...prev, colorOption],
                    )
                  }}
                  className={`px-4 py-2 rounded-lg transition-all text-sm`}
                  style={{
                    backgroundColor: selectedColors.includes(colorOption)
                      ? colorMap[colorOption]
                      : 'white',
                    color: selectedColors.includes(colorOption)
                      ? ['Blanco', 'Amarillo', 'Beige'].includes(colorOption)
                        ? 'black'
                        : 'white'
                      : 'black',
                    border:
                      selectedColors.includes(colorOption) && colorOption === 'Blanco'
                        ? '2px solid black'
                        : '1px solid #e5e7eb',
                  }}
                >
                  {colorOption}
                </button>
              ))}
            </div>
            {selectedColors.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Seleccionados: {selectedColors.join(', ')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              onChange={() => setBestseller((prev) => !prev)}
              checked={bestseller}
              type="checkbox"
              id="bestseller"
              className="w-4 h-4 accent-[#c9a0a0]"
            />
            <label className="cursor-pointer text-sm text-gray-600" htmlFor="bestseller">
              Mostrar como Best Seller
            </label>
          </div>
        </div>
      </SectionCard>

      {/* Sección: Precio */}
      <SectionCard title="Precio">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-600 mb-1">Valor unitario ($)</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className={inputClass}
            type="number"
            placeholder="10000"
            required
          />
        </div>
      </SectionCard>

      <div className="w-full flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          SUBIR PRODUCTO
        </button>
      </div>
    </form>
  )
}

export default Add
