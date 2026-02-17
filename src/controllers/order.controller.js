const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const { sendOrderNotification } = require('../config/email.config');

exports.createOrder = async (req, res, next) => {
  try {
    const { product, seller, quantity = 1, type = 'purchase' } = req.body;

    const productData = await Product.findById(product);
    if (!productData) return res.status(404).json({ message: 'Producto no encontrado' });
    if (productData.status !== 'published') return res.status(400).json({ message: 'Producto no disponible' });

    const totalPrice = productData.price * quantity;

    const order = new Order({
      buyer: req.user.id,
      product,
      seller: seller || productData.seller,
      quantity,
      totalPrice,
      type,
    });

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'product',
        select: 'title price images category description seller',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'seller', select: 'name email avatar _id' }
        ]
      })
      .populate('seller', 'name email avatar');

    try {
      await sendOrderNotification(populatedOrder, req.user);
    } catch (emailErr) {
      console.error('Error sending order emails:', emailErr);
    }

    res.status(201).json(populatedOrder);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate({
        path: 'product',
        select: 'title price images category description seller status',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'seller', select: 'name email avatar _id' }
        ]
      })
      .populate('seller', 'name email avatar')
      .sort('-createdAt');

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('product', 'title')
      .populate('buyer', 'name')
      .sort('-createdAt');

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (order.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};