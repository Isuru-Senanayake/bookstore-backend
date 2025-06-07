const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get current user's cart
router.get('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { userId: req.user.id, items: [] });
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  const { bookId, title, author, price, quantity } = req.body;

  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(item => item.bookId === bookId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ bookId, title, author, price, quantity });
  }

  await cart.save();
  res.json(cart);
});

// Remove item from cart
router.post('/remove', auth, async (req, res) => {
  const { bookId } = req.body;
  const cart = await Cart.findOne({ userId: req.user.id });

  if (cart) {
    cart.items = cart.items.filter(item => item.bookId !== bookId);
    await cart.save();
  }

  res.json(cart);
});

// Clear entire cart
router.delete('/', auth, async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user.id });
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
