import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { backendUrl } = useContext(ShopContext);
  
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching slides from:', `${backendUrl}/api/hero-slides`);
        const response = await axios.get(`${backendUrl}/api/hero-slides`);
        console.log('Slides response:', response.data);
        
        if (response.data.success && response.data.slides) {
          setSlides(response.data.slides);
        } else {
          console.log('No slides found in response');
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, [backendUrl]);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return (
      <div className="h-[600px] sm:h-[500px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-[600px] sm:h-[500px] flex items-center justify-center">
        <p>No se encontraron productos</p>
      </div>
    );
  }

  const handleSlideChange = (direction) => {
    if (direction === 'next') {
      setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
    } else {
      setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
    }
  };

  return (
    <div className='relative overflow-hidden border border-gray-200 rounded-lg shadow-sm h-[600px] sm:h-[500px]'>
      <div className='flex h-full'>
        {/* Left Content */}
        <motion.div 
          className='hidden sm:flex w-1/2 items-center justify-center bg-white p-12'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='text-center sm:text-left'>
            <motion.div 
              className='space-y-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className='flex items-center gap-3 justify-center sm:justify-start'>
                <div className='w-8 md:w-12 h-[2px] bg-gray-800'></div>
                <p className='text-sm md:text-base font-medium tracking-wider'>
                  {slides[currentSlide].subtitle}
                </p>
              </div>
              
              <h1 className='text-4xl lg:text-6xl tracking-wide prata-regular leading-tight'>
                {slides[currentSlide].title}
              </h1>
              
              <Link 
                to={`/product/${slides[currentSlide].productId}`}
                className='inline-flex items-center gap-3 group'
              >
                <span className='text-sm font-semibold tracking-wider'>
                  COMPRAR AHORA
                </span>
                <div className='w-8 md:w-12 h-[2px] bg-gray-800 transform transition-transform group-hover:w-16'></div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Carousel */}
        <div className='relative w-full sm:w-1/2'>
          <AnimatePresence mode='wait'>
            <motion.img
              key={currentSlide}
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className='absolute inset-0 w-full h-full object-cover'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg'; // Asegúrate de tener una imagen de placeholder
              }}
            />
          </AnimatePresence>

          {/* Mobile Content Overlay */}
          <div className='absolute inset-0 flex items-center justify-center sm:hidden bg-black/30'>
            <div className='text-center text-white p-6'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-4'
              >
                <p className='text-sm font-medium tracking-wider'>
                  {slides[currentSlide].subtitle}
                </p>
                <h1 className='text-3xl prata-regular'>
                  {slides[currentSlide].title}
                </h1>
                <Link 
                  to={`/product/${slides[currentSlide].productId}`}
                  className='inline-block px-6 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors'
                >
                  COMPRAR AHORA
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className='absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4'>
            <button 
              onClick={() => handleSlideChange('prev')}
              className='p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors'
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => handleSlideChange('next')}
              className='p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors'
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Slide Indicators */}
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-6 bg-white' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;