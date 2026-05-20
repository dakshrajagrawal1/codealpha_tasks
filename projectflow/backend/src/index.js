require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const routes = require('./routes');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Attach io to every request for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ProjectFlow API running on http://localhost:${PORT}`);
  console.log(`   WebSocket server ready`);
  console.log(`\n📋 Demo accounts:`);
  console.log(`   alice@demo.com / password123`);
  console.log(`   bob@demo.com   / password123`);
  console.log(`   carol@demo.com / password123\n`);
});
