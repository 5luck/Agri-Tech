import { Order } from '../../models/Order.js';
import { Product } from '../../models/Product.js';
import { dispatchNotification } from '../../services/notifications/notificationDispatcher.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order must contain at least one item', 400);
    }

    if (!shippingAddress?.name || !shippingAddress?.street || !shippingAddress?.villageOrCity || !shippingAddress?.district || !shippingAddress?.state || !shippingAddress?.pinCode || !shippingAddress?.phone) {
      return sendError(res, 'Complete shipping address including contact phone is required', 400);
    }

    const orderItems = [];
    let calculatedTotal = 0;

    // Verify each item from the database, check stock, and snapshot validated prices
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendError(res, `Product with ID ${item.productId} was not found`, 404);
      }

      if (!product.isActive || product.approvalStatus !== 'approved') {
        return sendError(res, `Product "${product.name}" is currently unavailable for purchase`, 400);
      }

      const qty = parseInt(item.quantity, 10);
      if (qty <= 0) {
        return sendError(res, `Invalid quantity for ${product.name}`, 400);
      }

      if (product.stock < qty) {
        return sendError(res, `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`, 400);
      }

      const unitPrice = product.price; // Server-validated price
      const subtotal = unitPrice * qty;
      calculatedTotal += subtotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: qty,
        unitPrice,
        unit: product.unit,
        subtotal
      });

      // Safely decrement inventory
      product.stock -= qty;
      await product.save();
    }

    // Generate readable order number
    const orderNumber = `AGRI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      orderNumber,
      buyerId: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      currency: 'INR',
      orderStatus: 'pending',
      paymentStatus: 'unpaid', // Development mode checkout: pending payment confirmation
      shippingAddress
    });

    // Notify buyer
    await dispatchNotification({
      userId: req.user._id,
      type: 'order',
      title: 'Order Placed Successfully',
      message: `Your order #${orderNumber} for ₹${calculatedTotal.toLocaleString('en-IN')} has been placed.`,
      resourceType: 'Order',
      resourceId: order._id
    });

    return sendSuccess(res, order, 'Order created successfully in development mode', 201);
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { buyerId: req.user._id };
    const orders = await Order.find(filter)
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, orders, 'Orders retrieved');
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyerId', 'name email phone');
    if (!order) return sendError(res, 'Order not found', 404);

    if (req.user.role !== 'admin' && order.buyerId._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, order, 'Order details retrieved');
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);

    if (req.user.role !== 'admin' && order.buyerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return sendError(res, `Cannot cancel order with status: ${order.orderStatus}`, 400);
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return sendSuccess(res, order, 'Order cancelled and inventory restored');
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);

    if (req.user.role !== 'admin') {
      return sendError(res, 'Only administrators can update order status directly', 403);
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    await dispatchNotification({
      userId: order.buyerId,
      type: 'order',
      title: 'Order Status Update',
      message: `Your order #${order.orderNumber} status changed to ${order.orderStatus}.`,
      resourceType: 'Order',
      resourceId: order._id
    });

    return sendSuccess(res, order, 'Order status updated successfully');
  } catch (err) {
    next(err);
  }
};
