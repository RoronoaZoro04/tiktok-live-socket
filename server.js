// server.js
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

// Home route to render our EJS page
app.get('/', (req, res) => {
  res.render('index');
});

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server on the path /ws
const wss = new WebSocket.Server({ server, path: '/tikfinity/ws' });

// Function to broadcast data to all connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// When a WebSocket connection is established (from TikFinity or a browser)
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Listen for incoming messages (events from TikFinity)
  ws.on('message', (message) => {
    console.log('Received message:', message);
    try {
      const eventData = JSON.parse(message);
      console.log('Parsed event data:', eventData);
      // Optionally, process or store the eventData here

      // Broadcast the event data to all connected clients (including the sender)
      broadcast(eventData);
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

app.get('/tikfinity', (req, res) => {
    res.render('index');
  });
  
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Configure TikFinity with the WebSocket URL: ws://aproapemoka.ro:${PORT}/ws`);
});
