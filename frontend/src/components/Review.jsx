import React, { useState } from 'react';
import { assets } from '../assets/assets';

const Review = ({ review, isUserReview }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b pb-4 mb-4">
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
                  <img
                    key={index}
                    src={index < review.rating ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className="w-3 h-3"
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
            {isUserReview && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Tu reseña
              </span>
            )}
          </div>
          <p className="mt-2 text-gray-600">{review.comment}</p>
        </div>
      </div>
    </div>
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
    <form onSubmit={handleSubmit} className="border-b pb-6 mb-6">
      <h3 className="font-medium mb-4">Escribe una reseña</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Calificación</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none"
            >
              <img
                src={star <= (hoveredStar || rating) ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="w-6 h-6 transition-transform hover:scale-110"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-2">
          Comentario
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black/10"
          rows="4"
          placeholder="Comparte tu experiencia con este producto..."
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={!rating || !comment || isLoading}
        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </form>
  );
};

export default Review;
