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
          console.log('First slide productId structure:', response.data.slides[0].productId);
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
      <div className="h-[600px] sm:h-[400px] flex items-center justify-center bg-neutral-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-[600px] sm:h-[400px] flex items-center justify-center bg-neutral-50">
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
    <div className='relative bg-neutral-50'>
      <div className='max-w-[1800px] mx-auto'>
        <div className='relative overflow-hidden h-[600px] sm:h-[400px]'>
          <div className='flex h-full'>
            {/* Left Content */}
            <motion.div 
              className='hidden sm:flex w-1/2 items-center justify-center p-8 lg:p-12'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className='max-w-xl'>
                <motion.div 
                  className='space-y-4 sm:space-y-6'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-[1px] bg-neutral-400'></div>
                    <p className='text-sm uppercase tracking-[0.2em] text-neutral-500'>
                      {slides[currentSlide].subtitle}
                    </p>
                  </div>
                  
                  <h1 className='text-3xl sm:text-4xl xl:text-5xl tracking-tight leading-[1.1] font-light'>
                    {slides[currentSlide].title}
                  </h1>
                  
                  <Link 
                    to={`/product/${slides[currentSlide].productId._id}`}
                    className='inline-flex items-center gap-4 group'
                  >
                    <span className='text-sm tracking-wider border-b border-neutral-900 pb-1 transition-colors group-hover:border-neutral-500'>
                      COMPRAR AHORA
                    </span>
                    <svg 
                      className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Carousel */}
            <div className='relative w-full sm:w-1/2'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentSlide}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/5" />
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      className='w-auto h-full max-w-full object-contain'
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Mobile Content Overlay */}
              <div className='absolute inset-0 flex items-center justify-center sm:hidden bg-black/20'>
                <div className='text-center text-white p-8'>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='space-y-6'
                  >
                    <p className='text-sm uppercase tracking-[0.2em]'>
                      {slides[currentSlide].subtitle}
                    </p>
                    <h1 className='text-4xl font-light leading-tight'>
                      {slides[currentSlide].title}
                    </h1>
                    <Link 
                      to={`/product/${slides[currentSlide].productId}`}
                      className='inline-block px-8 py-3 border border-white hover:bg-white hover:text-black transition-colors text-sm tracking-wider'
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
                  className='p-2 sm:p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors backdrop-blur-sm'
                  aria-label="Previous slide"
                >
                  <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleSlideChange('next')}
                  className='p-2 sm:p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors backdrop-blur-sm'
                  aria-label="Next slide"
                >
                  <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Slide Indicators */}
              <div className='absolute bottom-6 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-2'>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-[2px] transition-all duration-300 ${
                      currentSlide === index 
                        ? 'w-8 sm:w-6 bg-white' 
                        : 'w-4 sm:w-3 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;