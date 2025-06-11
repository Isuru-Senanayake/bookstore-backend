const express = require('express');
const axios = require('axios');
const router = express.Router();

// Example: GET /api/books/search?q=harry
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=20`
    );
    const books = response.data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      description: item.volumeInfo.description,
      price: Math.floor(Math.random() * 1000) // Random price
    }));
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

module.exports = router;
