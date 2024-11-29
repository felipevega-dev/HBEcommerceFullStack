import express from 'express';
import { createPreference, handleWebhook } from '../controllers/mercadoPagoController.js';
import authUser from '../middleware/auth.js';

const mercadoPagoRouter = express.Router();

mercadoPagoRouter.post('/create-preference', authUser, createPreference);
mercadoPagoRouter.post('/webhook', handleWebhook);

export default mercadoPagoRouter; 