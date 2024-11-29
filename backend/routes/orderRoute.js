import express from 'express';
import { placeOrder, placeOrderMercadoPago, placeOrderPaypal, allOrders, userOrders, updateStatus } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';


const orderRouter = express.Router();


//Admin features
orderRouter.get('/list', adminAuth, allOrders);
orderRouter.put('/status', adminAuth, updateStatus);

// Payment features
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/mercado-pago', authUser, placeOrderMercadoPago);
orderRouter.post('/paypal', authUser, placeOrderPaypal);

// User features    
orderRouter.get('/user-orders', authUser, userOrders);


export default orderRouter;