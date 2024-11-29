import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'

const Collections = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [sortType, setSortType] = useState('latest');

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
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

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subcategory.length > 0) {
      productsCopy = productsCopy.filter(item => subcategory.includes(item.subCategory));
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
  }, [products, category, subcategory, search, showSearch, sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Left */}
      <div className='min-w-44'>
        <p onClick={() => setShowFilters(!showFilters)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTROS
          <img src={assets.dropdown_icon} alt='filter' className={`h-3 sm:hidden ${showFilters ? 'rotate-90' : ''}`} />
        </p>
        {/* Filtro Categorías */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilters ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORÍAS</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2 items-center'>
              <input type='checkbox' className='w-3' value={'Prendas'} onChange={toggleCategory}/> Prendas
            </p>
            <p className='flex gap-2 items-center'>
              <input type='checkbox' className='w-3' value={'Accesorios'} onChange={toggleCategory}/> Accesorios
            </p>
            <p className='flex gap-2 items-center'>
              <input type='checkbox' className='w-3' value={'Arneses'} onChange={toggleCategory}/> Arneses
            </p>
          </div>
        </div>
        {/* Subcategorías */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilters ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>SUBCATEGORÍAS</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2 items-center'>
              <input type='checkbox' className='w-3' value={'Polerones'} onChange={toggleSubcategory}/> Polerones
            </p>
            <p className='flex gap-2 items-center'>
              <input type='checkbox' className='w-3' value={'Vestidos'} onChange={toggleSubcategory}/> Vestidos
            </p>
            <p className='flex gap-2 items-center'>
              <input type='checkbox' className='w-3' value={'Camisas'} onChange={toggleSubcategory}/> Camisas
            </p>  
          </div>
        </div>
      </div>

      {/* Right */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'> 
         <Title text1='TODOS' text2='LOS PRODUCTOS'/>
         {/* Sort */}
         <select className='border-2 border-gray-300 text-sm px-2' onChange={(e) => setSortType(e.target.value)}>
          <option value='latest'>Más recientes</option>
          <option value='oldest'>Más antiguos</option>
          <option value='price_asc'>Menor precio</option>
          <option value='price_desc'>Mayor precio</option>
         </select>
        </div>
        {/* Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item, index) => (
              <ProductItem 
                key={index} 
                name={item.name} 
                id={item._id} 
                price={item.price} 
                image={item.images}
              />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Collections