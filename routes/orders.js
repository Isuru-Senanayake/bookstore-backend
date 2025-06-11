const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');


// Place order
router.post('/', auth, async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = new Order({
    userId: req.user.id,
    items: cart.items,
    totalAmount,
    shippingAddress,
    paymentMethod
  });

  await order.save();
  await Cart.findOneAndDelete({ userId: req.user.id });

  res.json(order);
});

// Get current user's orders
router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
