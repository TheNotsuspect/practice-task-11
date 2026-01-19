require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// =======================
// ENV VARIABLES
// =======================
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// =======================
// MONGODB CONNECTION
// =======================
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// =======================
// SCHEMA & MODEL
// =======================
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String
});

const Item = mongoose.model('Item', itemSchema);

// =======================
// ROUTES
// =======================

// GET /
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// GET /api/items
app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// GET /api/items/:id
app.get('/api/items/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.json(item);
});

// POST /api/items
app.post('/api/items', async (req, res) => {
  const newItem = new Item(req.body);
  const savedItem = await newItem.save();
  res.json(savedItem);
});

// PUT /api/items/:id
app.put('/api/items/:id', async (req, res) => {
  const updatedItem = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedItem);
});

// DELETE /api/items/:id
app.delete('/api/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deleted' });
});

// =======================
// SERVER START
// =======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
