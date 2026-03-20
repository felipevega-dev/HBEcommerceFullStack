import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'

const placeOrder = async (req, res) => {
  try {
    console.log('Usuario autenticado:', req.user)
    console.log('Datos recibidos:', req.body)

    const { items, amount, address } = req.body
    const userId = req.user.id

    const orderData = {
      userId,
      items,
      address,
      amount,
      status: 'pending',
      paymentMethod: 'COD',
      payment: false,
      date: Date.now(),
    }

    console.log('Order data a guardar:', orderData)

    const newOrder = new orderModel(orderData)
    await newOrder.save()

    await userModel.findByIdAndUpdate(userId, { cartData: {} })

    res.json({
      success: true,
      message: 'Order placed successfully',
    })
  } catch (error) {
    console.error('Error en placeOrder:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    })
  }
}

const placeOrderMercadoPago = async (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'placeOrderMercadoPago no implementado',
  })
}

const placeOrderPaypal = async (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'placeOrderPaypal no implementado',
  })
}

const allOrders = async (_req, res) => {
  try {
    const orders = await orderModel.find()
    res.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error('Error al obtener todas las ordenes:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener todas las ordenes',
    })
  }
}

const userOrders = async (req, res) => {
  try {
    const userId = req.user.id

    const orders = await orderModel.find({ userId }).sort({ date: -1 })

    res.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error('Error al obtener ordenes:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ordenes',
    })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required',
      })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      })
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
    })
  }
}

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      })
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId)

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    res.json({
      success: true,
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
    })
  }
}

export {
  placeOrder,
  placeOrderMercadoPago,
  placeOrderPaypal,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
}
