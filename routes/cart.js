const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Define Cart schema
const cartSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      quantity: Number
    }
  ]
});

const Cart = mongoose.model("Cart", cartSchema);

// Get user's cart
router.get("/:userId", async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.json(cart || { userId: req.params.userId, items: [] });
});

// Add/update item in cart
router.post("/:userId", async (req, res) => {
  const { productId, title, price, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.params.userId });

  if (!cart) {
    cart = new Cart({ userId: req.params.userId, items: [] });
  }

  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, title, price, quantity });
  }

  await cart.save();
  res.json(cart);
});

// Remove item from cart
router.delete("/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const cart = await Cart.findOne({ userId });

  if (cart) {
    cart.items = cart.items.filter(item => item.productId !== productId);
    await cart.save();
  }

  res.json(cart);
});

module.exports = router;
