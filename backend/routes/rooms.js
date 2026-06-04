const express = require('express');
const router = express.Router();
const GameRoom = require('../models/GameRoom');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Create room
router.post('/create', protect, async (req, res) => {
  try {
    const { game, gameType, mode, maxPlayers } = req.body;
    const roomCode = uuidv4().slice(0, 8).toUpperCase();
    
    const room = await GameRoom.create({
      roomCode,
      game,
      gameType: gameType || 'tictactoe',
      host: req.user._id,
      mode: mode || 'public',
      maxPlayers: maxPlayers || 2,
      players: [{
        user: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        isReady: false,
        score: 0,
        isConnected: true,
      }],
    });

    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get room by code
router.get('/:roomCode', protect, async (req, res) => {
  try {
    const room = await GameRoom.findOne({ roomCode: req.params.roomCode })
      .populate('players.user', 'username avatar level rank')
      .populate('host', 'username avatar');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get public rooms
router.get('/list/public', protect, async (req, res) => {
  try {
    const rooms = await GameRoom.find({ mode: 'public', status: 'waiting' })
      .populate('host', 'username avatar')
      .limit(20)
      .sort('-createdAt');
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
