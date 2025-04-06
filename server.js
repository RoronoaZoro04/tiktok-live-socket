const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files if needed (e.g., CSS, client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming form data and JSON
app.use(express.json()); // To parse application/json
app.use(express.urlencoded({ extended: true })); // To parse application/x-www-form-urlencoded (TikFinity)

// Home route to render our EJS page
app.get('/', (req, res) => {
  res.render('index');
});

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

// Webhook route to handle incoming POST requests from TikFinity
app.post('/tikfinity/webhook', (req, res) => {
  // Log the received data
  console.log('Received webhook from TikFinity:', req.body);

  // Format the message for the WebSocket clients
  const eventData = {
    type: 'tiktok-event',
    username: req.body.value1 || 'Anonymous',
    message: req.body.value2 || '',
    gift: req.body.value3 || '',
    timestamp: Date.now()
  };

  // Broadcast the data to all WebSocket clients
  broadcast(eventData);

  // Send acknowledgment to TikFinity
  res.status(200).send('Received');
});

// Endpoint to render the EJS page for TikFinity events
app.get('/tikfinity', (req, res) => {
  res.render('index');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket URL: wss://api.ytmultidownloader.com/tikfinity/ws`);
  console.log(`Webhook POST URL: https://api.ytmultidownloader.com/tikfinity/webhook`);
});
