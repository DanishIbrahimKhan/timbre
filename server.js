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
  
  // Listen for notification requests and broadcast to ALL clients
  socket.on('trigger-notification', (data) => {
    console.log('Broadcasting notification:', data);
    io.emit('play-notification', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Notification Trigger</title>
      <style>
        body { font-family: Arial; padding: 40px; }
        button { 
          padding: 15px 30px; 
          font-size: 16px; 
          background: #3b82f6; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
        }
        button:hover { background: #2563eb; }
        #status { margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Send Notification to Mobile Android</h1>
      <button onclick="sendNotification()">Send Notification</button>
      <div id="status"></div>
      
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        const status = document.getElementById('status');
        
        socket.on('connect', () => {
          status.innerHTML = '✅ Connected';
        });
        
        function sendNotification() {
          socket.emit('trigger-notification', { 
            message: 'Hello from web!',
            timestamp: new Date().toISOString()
          });
          status.innerHTML = '📤 Notification sent!';
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});