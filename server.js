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
  
  // Listen for waiter call requests
  socket.on('waiter-call', (data) => {
    console.log('Waiter call received:', data);
    io.emit('waiter-notification', data);
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
      <title>Table Service System</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 100%;
        }
        h1 { 
          color: #333;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .table-number {
          color: #667eea;
          font-size: 18px;
          margin-bottom: 30px;
        }
        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .call-button {
          padding: 30px 20px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .call-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .call-button:active {
          transform: translateY(0);
        }
        .icon {
          font-size: 32px;
        }
        .water-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }
        .bill-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .waiter-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }
        .menu-btn {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }
        #status {
          margin-top: 20px;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
          display: none;
        }
        #status.show {
          display: block;
        }
        #status.connected {
          background: #d1fae5;
          color: #065f46;
        }
        #status.sent {
          background: #dbeafe;
          color: #1e40af;
        }
        .history {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
        .history h3 {
          color: #333;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .history-item {
          background: #f3f4f6;
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .history-type {
          font-weight: 600;
          color: #667eea;
        }
        .history-time {
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🍽️ Table Service</h1>
        <p class="table-number">Table #5</p>
        
        <div class="button-grid">
          <button class="call-button water-btn" onclick="callWaiter('water')">
            <span class="icon">💧</span>
            <span>Water</span>
          </button>
          
          <button class="call-button bill-btn" onclick="callWaiter('bill')">
            <span class="icon">🧾</span>
            <span>Bill</span>
          </button>
          
          <button class="call-button waiter-btn" onclick="callWaiter('waiter')">
            <span class="icon">🙋</span>
            <span>Call Waiter</span>
          </button>
          
          <button class="call-button menu-btn" onclick="callWaiter('menu')">
            <span class="icon">📋</span>
            <span>Menu</span>
          </button>
        </div>
        
        <div id="status"></div>
        
        <div class="history">
          <h3>Recent Calls</h3>
          <div id="history-list"></div>
        </div>
      </div>
      
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();
        const status = document.getElementById('status');
        const historyList = document.getElementById('history-list');
        const tableNumber = 5;
        let callHistory = [];
        
        socket.on('connect', () => {
          status.className = 'show connected';
          status.innerHTML = '✅ Connected to System';
          setTimeout(() => status.classList.remove('show'), 3000);
        });
        
        function callWaiter(type) {
          const requestTypes = {
            water: { text: 'Water Request', icon: '💧' },
            bill: { text: 'Bill Request', icon: '🧾' },
            waiter: { text: 'Waiter Call', icon: '🙋' },
            menu: { text: 'Menu Request', icon: '📋' }
          };
          
          const request = requestTypes[type];
          const timestamp = new Date();
          
          const data = {
            type: type,
            table: tableNumber,
            message: request.text,
            icon: request.icon,
            timestamp: timestamp.toISOString(),
            time: timestamp.toLocaleTimeString()
          };
          
          socket.emit('waiter-call', data);
          
          // Show status
          status.className = 'show sent';
          status.innerHTML = \`📤 \${request.icon} \${request.text} sent!\`;
          setTimeout(() => status.classList.remove('show'), 3000);
          
          // Add to history
          addToHistory(data);
        }
        
        function addToHistory(data) {
          callHistory.unshift(data);
          if (callHistory.length > 5) callHistory.pop();
          
          historyList.innerHTML = callHistory.map(item => \`
            <div class="history-item">
              <span class="history-type">\${item.icon} \${item.message}</span>
              <span class="history-time">\${item.time}</span>
            </div>
          \`).join('');
        }
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
  console.log('🍽️  Waiter Call System running on port ' + PORT);
});