import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import authUser from '../middleware/auth.js';

const uploadRouter = express.Router();

uploadRouter.post('/', authUser, uploadImage);

export default uploadRouter; 