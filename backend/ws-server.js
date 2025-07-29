const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Track clients by email
const clients = new Map();

wss.on('connection', (ws, req) => {
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'register' && data.email) {
        clients.set(data.email, ws);
        ws.email = data.email;
      }
    } catch {}
  });
  ws.on('close', () => {
    if (ws.email) clients.delete(ws.email);
  });
});

// Broadcast to all or by email
function sendNotification(email, payload) {
  if (email && clients.has(email)) {
    clients.get(email).send(JSON.stringify(payload));
  } else if (!email) {
    for (const ws of clients.values()) {
      ws.send(JSON.stringify(payload));
    }
  }
}

// Export for use in API
module.exports = { server, sendNotification };
