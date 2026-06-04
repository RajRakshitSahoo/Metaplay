const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// DB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/metaplay')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/matchhistory', require('./routes/matchhistory'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'MetaPlay API Running' }));

// Socket.IO
require('./socket/gameSocket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 MetaPlay Server running on port ${PORT}`));

module.exports = { app, io };
