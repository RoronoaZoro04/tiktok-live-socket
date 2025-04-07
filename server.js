const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create an HTTP server
const server = http.createServer(app);

// WebSocket server for real-time events
const wss = new WebSocket.Server({ server, path: '/tikfinity/ws' });

// Function to broadcast data to all connected WebSocket clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  ws.on('message', (message) => {
    console.log('Received message from WebSocket client:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

// API endpoint to handle incoming POST requests from TikFinity (or WordPress)
app.post('/tikfinity/webhook', (req, res) => {
  // Log the received data live
  console.log('Received webhook from TikFinity:', req.body);

  // Format the event data
  const eventData = {
    type: 'tiktok-event',
    username: req.body.value1 || 'Anonymous',
    message: req.body.value2 || '',
    gift: req.body.value3 || '',
    timestamp: Date.now()
  };

  // Broadcast the data to all connected WebSocket clients
  broadcast(eventData);

  // Respond with a JSON acknowledgment
  res.status(200).json({ status: 'Received', data: eventData });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket URL: wss://your-domain.com/tikfinity/ws`);
  console.log(`Webhook POST URL: https://your-domain.com/tikfinity/webhook`);
});
