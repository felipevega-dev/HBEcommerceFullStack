import express from 'express';
import { getCategories, addCategory, addSubcategory } from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

categoryRouter.get('/', getCategories);
categoryRouter.post('/add', adminAuth, addCategory);
categoryRouter.post('/subcategory/add', adminAuth, addSubcategory);

export default categoryRouter; 