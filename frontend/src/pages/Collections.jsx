import React, { useContext, useState, useEffect, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { motion, AnimatePresence } from 'framer-motion'
import { assets } from '../assets/assets'
import ProductItem from '../components/ProductItem'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'

const Collections = () => {
  const { products, search, showSearch, backendUrl } = useContext(ShopContext)
  const [showFilters, setShowFilters] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [subcategory, setSubcategory] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [sortType, setSortType] = useState('latest')
  const [categories, setCategories] = useState([])
  const [showCategories, setShowCategories] = useState(true)
  const [showSubcategories, setShowSubcategories] = useState(true)
  const [showColors, setShowColors] = useState(true)
  const [showSizes, setShowSizes] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const productsPerPage = 12

  // Obtener colores únicos de los productos
  const availableColors = useMemo(() => {
    const colors = new Set()
    products.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach(color => colors.add(color))
      }
    })
    return [...colors]
  }, [products])

  // Obtener tallas únicas de los productos
  const availableSizes = useMemo(() => {
    const sizes = new Set()
    products.forEach(product => {
      product.sizes.forEach(size => sizes.add(size))
    })
    return Array.from(sizes)
  }, [products])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category`)
        if (response.data.success) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [backendUrl])

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
      // Limpiar subcategorías si se deselecciona la categoría padre
      setSubcategory(prev => prev.filter(sub => {
        const cat = categories.find(c => c.name === e.target.value);
        return !cat?.subcategories.includes(sub);
      }));
    } else {
      setCategory(prev => [...prev, e.target.value]);
    }
  }

  const toggleSubcategory = (e) => {
    if (subcategory.includes(e.target.value)) {
      setSubcategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubcategory(prev => [...prev, e.target.value]);
    }
  }

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subcategory.length > 0) {
      productsCopy = productsCopy.filter(item => subcategory.includes(item.subCategory));
    }

    if (selectedColors.length > 0) {
      productsCopy = productsCopy.filter(item => 
        item.colors?.some(color => selectedColors.includes(color))
      );
    }

    if (selectedSizes.length > 0) {
      productsCopy = productsCopy.filter(item => 
        item.sizes.some(size => selectedSizes.includes(size))
      );
    }
    
    switch (sortType) {
      case 'latest':
        productsCopy.sort((a, b) => b.date - a.date);
        break;
      case 'oldest':
        productsCopy.sort((a, b) => a.date - b.date);
        break;
      case 'price_asc':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
    }
    
    setFilterProducts(productsCopy);
  }

  useEffect(() => {
    applyFilter();
  }, [products, category, subcategory, selectedColors, selectedSizes, search, showSearch, sortType]);

  // Obtener todas las subcategorías disponibles para las categorías seleccionadas
  const availableSubcategories = categories
    .filter(cat => category.length === 0 || category.includes(cat.name))
    .reduce((acc, cat) => [...acc, ...cat.subcategories], []);

  const clearAllFilters = () => {
    setCategory([]);
    setSubcategory([]);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Calcular productos para la página actual
  const currentProducts = filterProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )
  const totalPages = Math.ceil(filterProducts.length / productsPerPage)

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.div 
      className='flex flex-col sm:flex-row gap-8 pt-10 border-t'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Filtros */}
      <motion.aside 
        className='w-full sm:w-64 flex-shrink-0'
        initial={{ x: -20 }}
        animate={{ x: 0 }}
      >
        <div className='sticky top-24'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-medium'>Filtros</h2>
            {(category.length > 0 || subcategory.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className='space-y-4'>
            {/* Acordeón de Categorías */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="w-full px-5 py-3 flex justify-between items-center bg-gray-50"
              >
                <span className="font-medium">Categorías</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4"
                  >
                    {categories.map((cat) => (
                      <label key={cat.name} className="flex items-center gap-2 py-1">
                        <input 
                          type='checkbox' 
                          className='w-4 h-4 rounded border-gray-300' 
                          value={cat.name}
                          checked={category.includes(cat.name)}
                          onChange={toggleCategory}
                        /> 
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Acordeón de Subcategorías */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSubcategories(!showSubcategories)}
                className="w-full px-5 py-3 flex justify-between items-center bg-gray-50"
              >
                <span className="font-medium">Subcategorías</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showSubcategories ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showSubcategories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4"
                  >
                    {availableSubcategories.map((subcat) => (
                      <label key={subcat} className="flex items-center gap-2 py-1">
                        <input 
                          type='checkbox' 
                          className='w-4 h-4 rounded border-gray-300' 
                          value={subcat}
                          checked={subcategory.includes(subcat)}
                          onChange={toggleSubcategory}
                        /> 
                        <span className="text-sm">{subcat}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Acordeón de Colores */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowColors(!showColors)}
                className="w-full px-5 py-3 flex justify-between items-center bg-gray-50"
              >
                <span className="font-medium">Colores</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showColors ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showColors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4"
                  >
                    {availableColors.map((color) => (
                      <label key={color} className="flex items-center gap-2 py-1">
                        <input 
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span 
                          className="w-4 h-4 rounded-full inline-block mr-2"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        <span className="text-sm">{color}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Acordeón de Tallas */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSizes(!showSizes)}
                className="w-full px-5 py-3 flex justify-between items-center bg-gray-50"
              >
                <span className="font-medium">Tallas</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showSizes ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {showSizes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4"
                  >
                    {availableSizes.map((size) => (
                      <label key={size} className="flex items-center gap-2 py-1">
                        <input 
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleSize(size)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Productos */}
      <div className='flex-1'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-medium'>
            Todos los Productos
            <span className='text-sm text-gray-500 ml-2'>
              ({filterProducts.length} productos)
            </span>
          </h1>

          <select 
            className='px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200'
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
          >
            <option value='latest'>Más recientes</option>
            <option value='oldest'>Más antiguos</option>
            <option value='price_asc'>Menor precio</option>
            <option value='price_desc'>Mayor precio</option>
          </select>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
            {[...Array(12)].map((_, index) => (
              <div key={index} className='animate-pulse'>
                <div className='bg-gray-200 rounded-lg aspect-[3/4] mb-3'></div>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div 
              className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'
              layout
            >
              <AnimatePresence mode='popLayout'>
                {currentProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductItem
                      id={product._id}
                      name={product.name}
                      price={product.price}
                      image={product.images}
                      rating={product.rating}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Paginación */}
            {filterProducts.length > 0 && (
              <div className='flex justify-center gap-2 mt-12'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  ←
                </motion.button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === index + 1 
                        ? 'bg-black text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </motion.button>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  →
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default Collections