import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    assets.barbie_hero1,
    assets.barbie_hero2,
    assets.barbie_hero3,
    assets.barbie_hero4
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  return (
    <div className='flex flex-col sm:flex-row border border-gray-400 h-[600px] sm:h-[400px] relative z-0'>
      {/* left */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 bg-white'>
        <div className='text-[#414141]'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='text-sm font-medium md:text-base'>MÁS VENDIDAS</p>
          </div>
          <h1 className='text-3xl sm:py-3 lg:text-5xl leading-relaxed prata-regular'>Últimos Productos</h1>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-semibold md:text-base'>COMPRAR AHORA</p>
            <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
          </div>
        </div>
      </div>

      {/* right - carousel */}
      <div className='relative w-full sm:w-1/2 h-full'>
        {/* Imágenes */}
        <div className='absolute inset-0 overflow-hidden'>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{ transform: `translateX(${100 * (index - currentSlide)}%)` }}
            >
              <img 
                className='w-full h-full object-cover' 
                src={slide} 
                alt={`hero-${index + 1}`} 
              />
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <button 
          onClick={prevSlide}
          className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10'
        >
          ❮
        </button>
        <button 
          onClick={nextSlide}
          className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10'
        >
          ❯
        </button>

        {/* Indicadores */}
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero