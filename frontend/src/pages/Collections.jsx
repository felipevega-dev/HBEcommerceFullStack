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

  // Obtener colores únicos de los productos
  const availableColors = useMemo(() => {
    return [...new Set(products
      .filter(product => product.color)
      .map(product => product.color)
    )];
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
      productsCopy = productsCopy.filter(item => selectedColors.includes(item.color));
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

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Left */}
      <div className='min-w-44'>
        <p onClick={() => setShowFilters(!showFilters)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          FILTROS
          <img 
            src={assets.dropdown_icon} 
            alt='filter' 
            className={`h-3 sm:hidden ${showFilters ? 'rotate-90' : ''}`} 
          />
        </p>
        
        {/* Filtro Categorías */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilters ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORÍAS</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {categories.map((cat) => (
              <p key={cat.name} className='flex gap-2 items-center'>
                <input 
                  type='checkbox' 
                  className='w-3' 
                  value={cat.name}
                  checked={category.includes(cat.name)}
                  onChange={toggleCategory}
                /> 
                {cat.name}
              </p>
            ))}
          </div>
        </div>

        {/* Subcategorías */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilters ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>SUBCATEGORÍAS</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {availableSubcategories.map((subcat) => (
              <p key={subcat} className='flex gap-2 items-center'>
                <input 
                  type='checkbox' 
                  className='w-3' 
                  value={subcat}
                  checked={subcategory.includes(subcat)}
                  onChange={toggleSubcategory}
                /> 
                {subcat}
              </p>
            ))}
          </div>
        </div>

        {/* Filtro de Colores */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilters ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>COLORES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {availableColors.map((color) => (
              <p key={color} className='flex gap-2 items-center'>
                <input 
                  type='checkbox' 
                  className='w-3' 
                  value={color}
                  checked={selectedColors.includes(color)}
                  onChange={() => toggleColor(color)}
                /> 
                <span 
                  className='w-4 h-4 rounded-full inline-block mr-2'
                  style={{ backgroundColor: color.toLowerCase() }}
                ></span>
                {color}
              </p>
            ))}
          </div>
        </div>

        {/* Filtro de Tallas */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilters ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TALLAS</p>
          <div className='flex flex-wrap gap-2'>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 border rounded ${
                  selectedSizes.includes(size) 
                    ? 'bg-black text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
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
          {filterProducts.map((item, index) => (
            <ProductItem 
              key={index} 
              name={item.name} 
              id={item._id} 
              price={item.price} 
              image={item.images}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collections;