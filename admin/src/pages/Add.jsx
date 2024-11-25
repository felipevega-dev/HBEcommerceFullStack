import React, { useState } from 'react'
import { assets } from '../assets/assets'

const Add = () => {

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Prendas')
  const [subcategory, setSubcategory] = useState('Polerones')
  const [price, setPrice] = useState('')
  const [sizes, setSizes] = useState([])
  const [bestseller, setBestseller] = useState(false)
  
  return (
    <form className='flex flex-col w-full items-start gap-3'>
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
            <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2' required>
              <option value="Prendas">Prendas</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Arneses">Arneses</option>
            </select>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <p className='text-lg font-semibold mb-2'>Subcategoria</p>
            <select onChange={(e) => setSubcategory(e.target.value)} className='w-full px-3 py-2' required>
              <option value="Polerones">Polerones</option>
              <option value="Vestidos">Vestidos</option>
              <option value="Camisetas">Camisetas</option>
            </select>
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

        <button type='submit' className='w-28 py-3 mt-4 bg-black text-white rounded-md'>SUBIR</button>

    </form>
  )
}

export default Add
