import userModel from '../models/userModel.js';

// add to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, size, quantity = 1 } = req.body;

        console.log('Adding to cart:', { userId, itemId, size, quantity }); // Debug

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Aseguramos que cartData sea un objeto
        let cartData = userData.cartData || {};

        // Inicializamos la estructura si no existe
        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        // Actualizamos para usar la cantidad proporcionada
        cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;

        // Actualizamos el documento y obtenemos el resultado actualizado
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true } // Esto retorna el documento actualizado
        );

        console.log('Updated cart:', updatedUser.cartData); // Debug

        res.json({
            success: true,
            message: 'Item added to cart',
            cartData: updatedUser.cartData
        });

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar al carrito'
        });
    }
}

// update cart
const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, size, quantity } = req.body;

        console.log('Updating cart:', { userId, itemId, size, quantity }); // Debug

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        let cartData = userData.cartData || {};

        if (quantity === 0) {
            // Eliminamos el item
            if (cartData[itemId]) {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        } else {
            // Actualizamos la cantidad
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
        }

        // Actualizamos y obtenemos el resultado
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { cartData },
            { new: true }
        );

        console.log('Updated cart:', updatedUser.cartData); // Debug

        res.json({
            success: true,
            message: 'Cart updated',
            cartData: updatedUser.cartData
        });

    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el carrito'
        });
    }
}

// get cart
const getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('Getting cart for user:', userId); // Debug
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Aseguramos que siempre devolvemos un objeto
        const cartData = userData.cartData || {};

        console.log('Retrieved cart:', cartData); // Debug

        res.json({
            success: true,
            cartData
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el carrito'
        });
    }
}

export { addToCart, updateCart, getUserCart };