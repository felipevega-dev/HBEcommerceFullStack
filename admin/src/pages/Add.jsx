import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({token}) => {

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
  const [selectedColors, setSelectedColors] = useState([]);

  const availableColors = [
    'Negro', 'Blanco', 'Gris', 'Rojo', 'Azul', 'Verde', 
    'Amarillo', 'Rosa', 'Morado', 'Naranja', 'Marrón', 'Beige'
  ];

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category`);
        if (response.data.success) {
          setCategories(response.data.categories);
          if (response.data.categories.length > 0) {
            setCategory(response.data.categories[0].name);
            if (response.data.categories[0].subcategories.length > 0) {
              setSubcategory(response.data.categories[0].subcategories[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchCategories();
  }, [backendUrl]);

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/add`,
        { 
          name: newCategory,
          subcategories: [] 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories([...categories, response.data.category]);
        setCategory(newCategory);
        setNewCategory('');
        setShowNewCategoryInput(false);
        toast.success('Categoría añadida exitosamente');
      }
    } catch (error) {
      toast.error('Error al añadir categoría');
    }
  };

  const handleAddNewSubcategory = async () => {
    if (!newSubcategory.trim() || !category) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/category/subcategory/add`,
        {
          categoryName: category,
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
          cat.name === category 
            ? response.data.category 
            : cat
        ));
        setSubcategory(newSubcategory);
        setNewSubcategory('');
        setShowNewSubcategoryInput(false);
        toast.success('Subcategoría añadida exitosamente');
      }
    } catch (error) {
      toast.error('Error al añadir subcategoría');
    }
  };

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
        toast.error('Se requiere al menos una imagen');
        return;
      }

      if (sizes.length === 0) {
        toast.error('Selecciona al menos una talla');
        return;
      }

      if (selectedColors.length === 0) {
        toast.error('Selecciona al menos un color');
        return;
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
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      toast.promise(
        axios.post(backendUrl + '/api/product/add', formData, config),
        {
          pending: 'Subiendo producto...',
          success: {
            render({data}) {
              resetForm();
              return '¡Producto agregado exitosamente!';
            }
          },
          error: {
            render({data}) {
              return `Error: ${data.response?.data?.message || 'Error al subir el producto'}`;
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al crear el producto');
    }
  }
  
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='text-lg font-semibold mb-2'>Subir Imágenes</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20 ' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e) => setImage1(e.target.files[0])} type="file" id='image1' hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20 ' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e) => setImage2(e.target.files[0])} type="file" id='image2' hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20 ' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e) => setImage3(e.target.files[0])} type="file" id='image3' hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20 ' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e) => setImage4(e.target.files[0])} type="file" id='image4' hidden/>
            </label>
          </div>
        </div>

        <div className='flex flex-col gap-2 w-full'>
          <p className='text-lg font-semibold mb-2'>Nombre Producto</p>
          <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Escribe el nombre del producto' required/>
        </div>

        <div className='flex flex-col gap-2 w-full'>
          <p className='text-lg font-semibold mb-2'>Descripción</p>
          <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' placeholder='Escribe la descripción del producto' required/>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
          <div className='flex flex-col gap-2 w-full'>
            <p className='text-lg font-semibold mb-2'>Categoria Principal</p>
            {!showNewCategoryInput ? (
              <div className="flex gap-2">
                <select 
                  onChange={(e) => setCategory(e.target.value)} 
                  value={category}
                  className='w-full px-3 py-2' 
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

          <div className='flex flex-col gap-2 w-full'>
            <p className='text-lg font-semibold mb-2'>Subcategoria</p>
            {!showNewSubcategoryInput ? (
              <div className="flex gap-2">
                <select 
                  onChange={(e) => setSubcategory(e.target.value)}
                  value={subcategory}
                  className='w-full px-3 py-2'
                  required
                >
                  <option value="">Selecciona una subcategoría</option>
                  {categories
                    .find(cat => cat.name === category)
                    ?.subcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))
                  }
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubcategoryInput(true)}
                  className="px-3 py-2 bg-black text-white rounded"
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

          <div className='flex flex-col gap-2 w-full'>
            <p className='text-lg font-semibold mb-2'>Valor Unitario</p>
            <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full max-w-[500px] px-3 py-2' type="number" placeholder='10000' required/>
          </div>

        </div>

        <div className='flex flex-col gap-2 w-full'>
          <p className='text-lg font-semibold mb-2'>Tallas Disponibles</p>
          <div className='flex gap-3'>
            <div onClick={() => setSizes(prev => prev.includes('XS') ? prev.filter(item => item !== 'XS') : [...prev, 'XS'])}>
              <p className={`${sizes.includes('XS') ? 'bg-pink-100' : 'bg-slate-100'} cursor-pointer px-3 py-1 `}>XS</p>
            </div>
            <div onClick={() => setSizes(prev => prev.includes('S') ? prev.filter(item => item !== 'S') : [...prev, 'S'])}  >
              <p className={`${sizes.includes('S') ? 'bg-pink-100' : 'bg-slate-100'} cursor-pointer px-3 py-1 `}>S</p>
            </div>
            <div onClick={() => setSizes(prev => prev.includes('M') ? prev.filter(item => item !== 'M') : [...prev, 'M'])}>
              <p className={`${sizes.includes('M') ? 'bg-pink-100' : 'bg-slate-100'} cursor-pointer px-3 py-1 `}>M</p>
            </div>
            <div onClick={() => setSizes(prev => prev.includes('L') ? prev.filter(item => item !== 'L') : [...prev, 'L'])}>
              <p className={`${sizes.includes('L') ? 'bg-pink-100' : 'bg-slate-100'} cursor-pointer px-3 py-1 `}>L</p>
            </div>
            <div onClick={() => setSizes(prev => prev.includes('XL') ? prev.filter(item => item !== 'XL') : [...prev, 'XL'])}>
              <p className={`${sizes.includes('XL') ? 'bg-pink-100' : 'bg-slate-100'} cursor-pointer px-3 py-1 `}>XL</p>
            </div>
          </div>
        </div>
        <div className='flex mt-2 gap-2'>
          <input onChange={(e) => setBestseller(prev => !prev)} checked={bestseller} type="checkbox"  id='bestseller'/>
          <label className='cursor-pointer' htmlFor="bestseller">Mostrar como Best Seller</label>
        </div>

        <div className='flex flex-col gap-2 w-full'>
          <p className='text-lg font-semibold mb-2'>Colores</p>
          <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
            {availableColors.map((colorOption) => (
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
          <p className="text-sm text-gray-500 mt-1">
            Colores seleccionados: {selectedColors.join(', ')}
          </p>
        </div>

        <div className="w-full flex justify-end">
          <button type='submit' className='w-28 py-3 mt-4 bg-black text-white rounded-md'>SUBIR</button>
        </div>

    </form>
  )
}

export default Add
