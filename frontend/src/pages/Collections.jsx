import React, { useContext, useState, useEffect, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import axios from 'axios';

const Collections = () => {
  const { products, search, showSearch, backendUrl } = useContext(ShopContext);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortType, setSortType] = useState('latest');
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Obtener colores únicos de los productos
  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach(color => colors.add(color));
      }
    });
    return [...colors];
  }, [products]);

  // Obtener tallas únicas de los productos
  const availableSizes = useMemo(() => {
    const sizes = new Set();
    products.forEach(product => {
      product.sizes.forEach(size => sizes.add(size));
    });
    return Array.from(sizes);
  }, [products]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/category`);
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchCategories();
  }, [backendUrl]);

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
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filterProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filterProducts.length / productsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Left */}
      <div className='min-w-44'>
        <div className='flex justify-between items-center'>
          <p onClick={() => setShowFilters(!showFilters)} 
             className='my-2 text-xl flex items-center cursor-pointer gap-2'>
            FILTROS
            <img 
              src={assets.dropdown_icon} 
              alt='filter' 
              className={`h-3 sm:hidden ${showFilters ? 'rotate-90' : ''}`} 
            />
          </p>
          {(category.length > 0 || subcategory.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className={`space-y-4 ${showFilters ? '' : 'hidden'} sm:block`}>
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
            {showCategories && (
              <div className="p-4">
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
              </div>
            )}
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
            {showSubcategories && (
              <div className="p-4">
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
              </div>
            )}
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
            {showColors && (
              <div className="p-4">
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
              </div>
            )}
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
            {showSizes && (
              <div className="p-4">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'> 
          <Title text1='TODOS' text2='LOS PRODUCTOS'/>
          {/* Sort */}
          <select 
            className='border-2 border-gray-300 text-sm px-2' 
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value='latest'>Más recientes</option>
            <option value='oldest'>Más antiguos</option>
            <option value='price_asc'>Menor precio</option>
            <option value='price_desc'>Mayor precio</option>
          </select>
        </div>
        
        {/* Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {currentProducts.map((item, index) => (
            <ProductItem 
              key={index} 
              name={item.name} 
              id={item._id} 
              price={item.price} 
              image={item.images}
            />
          ))}
        </div>

        {/* Paginación */}
        {filterProducts.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              ←
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === index + 1 ? 'bg-black text-white' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Collections;