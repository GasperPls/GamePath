const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Replace with your IGDB API key and client ID
const apiKey = 'ze5s8nyeap7lt79hjpegww1b9g0eoh';
const clientId = '6epitxpes5udttl915kc8el5733olq';

// Middleware to allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Client-ID'); // Allow specific headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific HTTP methods

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // No content for preflight requests
  }

  next();
});

// Proxy endpoint for IGDB API
app.post('/api/games', express.json(), async (req, res) => {
  try {
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Client-ID': clientId
      },
      body: req.body.query
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});