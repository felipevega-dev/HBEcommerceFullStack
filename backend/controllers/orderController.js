import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import logger from '../config/logger.js'

const placeOrder = async (req, res, next) => {
  try {
    const { items, amount, address } = req.body
    const userId = req.user.id

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      status: 'pending',
      paymentMethod: 'COD',
      payment: false,
      date: Date.now(),
    })

    await newOrder.save()
    await userModel.findByIdAndUpdate(userId, { cartData: {} })

    res.json({ success: true, message: 'Order placed successfully' })
  } catch (error) {
    next(error)
  }
}

const placeOrderMercadoPago = async (_req, res) => {
  res.status(501).json({ success: false, message: 'placeOrderMercadoPago no implementado' })
}

const placeOrderPaypal = async (_req, res) => {
  res.status(501).json({ success: false, message: 'placeOrderPaypal no implementado' })
}

const allOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query

    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit)
      const [orders, total] = await Promise.all([
        orderModel.find().sort({ date: -1 }).skip(skip).limit(Number(limit)),
        orderModel.countDocuments(),
      ])
      return res.json({
        success: true,
        orders,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      })
    }

    const orders = await orderModel.find().sort({ date: -1 })
    res.json({ success: true, orders })
  } catch (error) {
    next(error)
  }
}

const userOrders = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { page, limit } = req.query

    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit)
      const [orders, total] = await Promise.all([
        orderModel.find({ userId }).sort({ date: -1 }).skip(skip).limit(Number(limit)),
        orderModel.countDocuments({ userId }),
      ])
      return res.json({
        success: true,
        orders,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      })
    }

    const orders = await orderModel.find({ userId }).sort({ date: -1 })
    res.json({ success: true, orders })
  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const { orderId, status } = req.body

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: 'Order ID and status are required' })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' })
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({ success: true, message: 'Order status updated successfully', order: updatedOrder })
  } catch (error) {
    next(error)
  }
}

const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' })
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId)
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({ success: true, message: 'Order deleted successfully' })
  } catch (error) {
    next(error)
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
