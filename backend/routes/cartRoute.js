import express from 'express';
import authUser from '../middleware/auth.js';
import { addToCart, updateCart, getUserCart } from '../controllers/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/add', authUser, addToCart);
cartRouter.post('/update', authUser, updateCart);
cartRouter.post('/get', authUser, getUserCart);

export default cartRouter;