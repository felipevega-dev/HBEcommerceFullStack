import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';

const Review = ({ review, isUserReview, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      className="border-b pb-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-start gap-4">
        <img
          src={review.userId.profileImage || assets.profiledefault}
          alt={review.userId.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{review.userId.name}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, index) => (
                  <motion.img
                    key={index}
                    src={index < review.rating ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className="w-3 h-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
            {isUserReview && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Tu reseña
                </span>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-600 text-sm"
                    title="Eliminar reseña"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-600">{review.comment}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const ReviewForm = ({ onSubmit, isLoading }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-b pb-8 mb-8">
      <h3 className="text-lg font-medium mb-4">Escribe una reseña</h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Calificación</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.img
                src={star <= (hoveredStar || rating) ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="w-8 h-8"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: star <= (hoveredStar || rating) ? 1 : 0.6 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-2">
          Tu opinión
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all resize-none"
          rows="4"
          placeholder="¿Qué te pareció este producto?"
          required
        ></textarea>
      </div>

      <motion.button
        type="submit"
        disabled={!rating || !comment || isLoading}
        className={`
          w-full sm:w-auto px-8 py-3 rounded-lg font-medium
          transition-all duration-200
          ${!rating || !comment || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800 active:transform active:scale-95'
          }
        `}
        whileHover={!isLoading && rating && comment ? { scale: 1.02 } : {}}
        whileTap={!isLoading && rating && comment ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enviando...
          </span>
        ) : 'Publicar reseña'}
      </motion.button>
    </form>
  );
};

export default Review;
