const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: '/tikfinity/ws' });

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  ws.on('message', (message) => {
    console.log('Received message from WebSocket client:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

app.post('/tikfinity/webhook', (req, res) => {
  console.log('Received webhook from TikFinity:', req.body);

  const eventData = req.body;

  broadcast(eventData);

  res.status(200).json({ status: 'Received', data: eventData });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket URL: wss://domain.com/tikfinity/ws`);
  console.log(`Webhook POST URL: https://domain.com/tikfinity/webhook`);
});
