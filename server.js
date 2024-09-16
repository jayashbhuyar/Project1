const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/hodlinfo', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create a schema for the cryptocurrency data
const cryptoSchema = new mongoose.Schema({
  name: String,
  last: String,
  buy: String,
  sell: String,
  volume: String,
  base_unit: String,
});

const Crypto = mongoose.model('Crypto', cryptoSchema);
app.use(express.static(path.join(__dirname, 'public')));
// Fetch data from API and store in MongoDB

async function fetchAndStoreData() {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = Object.values(response.data).slice(0, 10);

    await Crypto.deleteMany({}); // Clear existing data

    for (const ticker of tickers) {
      const crypto = new Crypto({
        name: ticker.name,
        last: ticker.last,
        buy: ticker.buy,
        sell: ticker.sell,
        volume: ticker.volume,
        base_unit: ticker.base_unit,
      });
      await crypto.save();
    }

    console.log('Data fetched and stored successfully');
  } catch (error) {
    console.error('Error fetching and storing data:', error);
  }
}

// Fetch data every 1 minute
setInterval(fetchAndStoreData, 60000);
fetchAndStoreData(); // Initial fetch

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API route to get stored data
app.get('/api/tickers', async (req, res) => {
  try {
    const tickers = await Crypto.find({});
    res.json(tickers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});