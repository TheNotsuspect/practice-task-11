const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;




app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});





const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let productsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db('shop');
  productsCollection = db.collection('products');
  console.log('Connected to MongoDB');
}

connectDB();




app.get('/', (req, res) => {
  res.send('<h1>Products API</h1>');
});






//////////
app.get('/api/products', async (req, res) => {
  const { category, minPrice, sort, fields } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (minPrice) filter.price = { $gte: Number(minPrice) };

  const sortOption = {};
  if (sort === 'price') sortOption.price = 1;

  const projection = {};
  if (fields) {
    projection._id = 0;
    fields.split(',').forEach(field => {
      projection[field] = 1;
    });
  }

  const products = await productsCollection
    .find(filter)
    .project(projection)
    .sort(sortOption)
    .toArray();

  res.json(products);
});


app.post('/api/products', async (req, res) => {
  const { name, price, category } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await productsCollection.insertOne({
    name,
    price,
    category
  });

  res.status(201).json({
    message: 'Product created',
    id: result.insertedId
  });
});







app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const product = await productsCollection.findOne({
    _id: new ObjectId(id)
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});







app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const result = await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, price, category } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ message: 'Product updated' });
});





app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const result = await productsCollection.deleteOne({
    _id: new ObjectId(id)
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ message: 'Product deleted' });
});




app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
//http://localhost:3000/api/products?category=electronics&minPrice=500&sort=price&fields=name,price