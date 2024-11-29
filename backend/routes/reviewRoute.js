import express from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';

const reviewRouter = express.Router();

reviewRouter.post('/', authUser, createReview);
reviewRouter.get('/product/:productId', getProductReviews);

export default reviewRouter; 