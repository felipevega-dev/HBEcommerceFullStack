import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// placing order using COD method

const placeOrder = async (req, res) => {
    try {
        console.log('Usuario autenticado:', req.user); // Debug user
        console.log('Datos recibidos:', req.body); // Debug request body
        
        const {items, amount, address} = req.body;
        const userId = req.user.id;

        const orderData = {
            userId,
            items,
            address,
            amount,
            status: 'pending',
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        }

        console.log('Order data a guardar:', orderData); // Debug order data

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, {cartData: {}});

        res.json({
            success: true,
            message: 'Order placed successfully'
        });

    } catch (error) {
        console.error('Error en placeOrder:', error); // Debug error
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}

// placing order using mercadopago
const placeOrderMercadoPago = async (req, res) => {
    try {
        const {items, amount, address} = req.body;
    } catch (error) {
        
    }
}

// placing order using paypal
const placeOrderPaypal = async (req, res) => {
    try {
        const {items, amount, address} = req.body;
    } catch (error) {
        
    }
}

// All order data for admin panel
const allOrders = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const orders = await orderModel.find({ userId })
            .sort({ date: -1 }); // Ordenar por fecha, más reciente primero
        
        res.json({
            success: true,
            orders
        });
        
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las órdenes'
        });
    }
}

// Update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export { placeOrder, placeOrderMercadoPago, placeOrderPaypal, allOrders, userOrders, updateStatus };