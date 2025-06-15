// bookshop-backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const bookRoutes = require('./routes/books');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/books', bookRoutes);

// Import routes
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");

// New order route and JWT middleware
const jwt = require("jsonwebtoken");

// Temporary in-memory order store (replace with DB later)
let orders = [];

// Middleware to protect routes using JWT
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "yourSecretKey");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
}

// Order routes
const orderRoutes = express.Router();

orderRoutes.post("/", authMiddleware, (req, res) => {
  const newOrder = {
    id: Date.now(),
    user: req.user.email,
    items: req.body.cart,
    total: req.body.total,
  };
  orders.push(newOrder);
  res.status(201).json({ msg: "Order placed successfully", order: newOrder });
});

orderRoutes.get("/", authMiddleware, (req, res) => {
  const userOrders = orders.filter((order) => order.user === req.user.email);
  res.json(userOrders);
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Books API route (Google Books)
app.get("/api/books", async (req, res) => {
  const query = req.query.q || "harry potter";

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${query}`
    );

    const books = response.data.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo.title || "No Title",
      authors: item.volumeInfo.authors || ["Unknown Author"],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
    }));

    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch((err) => console.error("MongoDB connection failed:", err));
