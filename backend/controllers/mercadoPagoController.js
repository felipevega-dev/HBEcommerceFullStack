import { MercadoPagoConfig, Preference } from 'mercadopago';
import orderModel from '../models/orderModel.js';

// Inicializar MercadoPago con la configuración
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

const createPreference = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        const userId = req.user.id;

        // Crear los items para MercadoPago
        const preferenceItems = items.map(item => ({
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            currency_id: "ARS",
            description: `Talla: ${item.size}`,
            picture_url: item.images?.[0]
        }));

        // Crear la preferencia
        const preference = {
            items: preferenceItems,
            back_urls: {
                success: `${process.env.FRONTEND_URL}/payment/success`,
                failure: `${process.env.FRONTEND_URL}/payment/failure`,
                pending: `${process.env.FRONTEND_URL}/payment/pending`
            },
            auto_return: "approved",
            external_reference: userId,
            notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`,
            binary_mode: true,
            statement_descriptor: "Tu Tienda",
            shipments: {
                receiver_address: {
                    street_name: address.street,
                    street_number: "123",
                    zip_code: address.postalCode,
                    city_name: address.city,
                    state_name: address.region,
                    country_name: address.country
                }
            }
        };

        // Crear la orden en estado pendiente
        const orderData = {
            userId,
            items,
            address,
            amount,
            status: 'pending',
            paymentMethod: 'mercadopago',
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Agregar el ID de la orden a la preferencia
        preference.external_reference = newOrder._id.toString();

        // Crear la preferencia usando el nuevo SDK
        const preferenceClient = new Preference(client);
        const response = await preferenceClient.create({ body: preference });

        res.json({
            success: true,
            preferenceId: response.id,
            orderId: newOrder._id
        });

    } catch (error) {
        console.error('Error al crear preferencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el pago'
        });
    }
};

const handleWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const payment = await client.payment.findById(data.id);
            const orderId = payment.external_reference;
            const paymentStatus = payment.status;

            let orderStatus;
            switch (paymentStatus) {
                case 'approved':
                    orderStatus = 'processing';
                    break;
                case 'pending':
                    orderStatus = 'pending';
                    break;
                case 'rejected':
                    orderStatus = 'cancelled';
                    break;
                default:
                    orderStatus = 'pending';
            }

            await orderModel.findByIdAndUpdate(orderId, {
                status: orderStatus,
                payment: paymentStatus === 'approved',
                'paymentDetails.mercadopago': payment
            });
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error en webhook:', error);
        res.sendStatus(500);
    }
};

export { createPreference, handleWebhook }; 