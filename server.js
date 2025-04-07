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
// Webhook route to handle incoming POST requests from TikFinity
app.post('/tikfinity/webhook', (req, res) => {
  // Log the received data
  console.log('Received webhook from TikFinity:', req.body);

  // Format the event data
  const eventData = {
      type: 'tiktok-event',
      username: req.body.value1 || 'Anonymous',
      message: req.body.content || '',
      avatar: req.body.avatar_url || '',
      likes: parseInt(req.body.likeCount, 10) || 0,
      totalLikes: parseInt(req.body.totalLikeCount, 10) || 0,
      timestamp: Date.now(),
      userId: req.body.userId,
      tikfinityUserId: req.body.tikfinityUserId,
      tikfinityUsername: req.body.tikfinityUsername
  };

  // Check thresholds for likes
  const interactionThresholds = {
      likes: 10,
      totalLikes: 50,
      shares: 5,  // Assume shares data will be in the webhook in future
      follows: 2  // Assume follows data will be in the webhook in future
  };

  let ticketCount = 0;

  if (eventData.likes >= interactionThresholds.likes) {
      ticketCount += 1; // Allocate 1 ticket per threshold crossed
  }
  if (eventData.totalLikes >= interactionThresholds.totalLikes) {
      ticketCount += 2; // Allocate 2 tickets for crossing totalLikes threshold
  }

  // Format ticket allocation data
  eventData.ticketCount = ticketCount;

  // Send data to WebSocket clients
  broadcast(eventData);

  // Send acknowledgment to TikFinity
  res.status(200).send('Received');
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket URL: wss://your-domain.com/tikfinity/ws`);
  console.log(`Webhook POST URL: https://your-domain.com/tikfinity/webhook`);
});
