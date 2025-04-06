const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // to parse JSON body from TikFinity

app.get('/', (req, res) => {
  res.render('index');
});

// WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/tikfinity/ws' });

// Broadcast function
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
});

// ✅ HTTP Webhook route for TikFinity
app.post('/tikfinity/webhook', (req, res) => {
  const data = req.body;
  console.log('Received webhook from TikFinity:', data);

  // Broadcast to WebSocket clients
  broadcast({
    type: 'webhook',
    ...data
  });

  res.status(200).send('Received');
});

// TikFinity Viewer Page
app.get('/tikfinity', (req, res) => {
  res.render('index');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at https://api.ytmultidownloader.com:${PORT}`);
  console.log(`WebSocket: wss://api.ytmultidownloader.com/tikfinity/ws`);
  console.log(`Webhook POST: https://api.ytmultidownloader.com/tikfinity/webhook`);
});
