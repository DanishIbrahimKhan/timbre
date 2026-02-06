// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve a simple webpage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Notification Trigger</title>
    </head>
    <body>
      <h1>Send Notification to Mobile</h1>
      <button onclick="sendNotification()">Send Notification</button>
      
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        
        function sendNotification() {
          socket.emit('play-notification', { message: 'Hello from web!' });
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = 3000;

http.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:' + PORT);
});