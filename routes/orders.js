const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      quantity: Number
    }
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

// Place an order
router.post("/", async (req, res) => {
  const { userId, items, total } = req.body;

  const order = new Order({ userId, items, total });
  await order.save();

  res.json({ message: "Order placed", order });
});

// Get all orders for a user
router.get("/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
