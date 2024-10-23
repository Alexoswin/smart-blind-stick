const express = require('express');
const locations = require('./mapCollection'); // Assuming this is your MongoDB model
const cors = require('cors');
const WebSocket = require('ws'); // WebSocket library

const app = express();
const PORT = 8000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Create an HTTP server and attach WebSocket server to it
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server });

// Store connected clients
let clients = [];

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');
  clients.push(ws); // Add client to the list

  // Handle incoming messages from client (optional)
  ws.on('message', (message) => {
    console.log('Received from client:', message);
  });

  // Remove client on close
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
    clients = clients.filter((client) => client !== ws);
  });
});

// Express routes
app.get('/', (req, res) => {
  res.json('Welcome to the server!');
});

// Location POST route
app.post('/location', async (req, res) => {
  const { lat, long, id } = req.body;

  const details = { lat, long, id };

  try {
    const result = await locations.findOneAndUpdate(
      { id: id },       // Match document by ID
      details,          // Update with new details
      { upsert: true, new: true } // Upsert if not found
    );

    // Send location update to all connected WebSocket clients
    const update = JSON.stringify({ message: 'Location Updated', data: result });
    clients.forEach((client) => client.send(update)); // Broadcast to all clients

    res.status(200).json({ message: 'Location upserted successfully!', data: result });
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json('Server error');
  }
});
