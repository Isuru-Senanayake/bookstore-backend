// bookshop-backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

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
