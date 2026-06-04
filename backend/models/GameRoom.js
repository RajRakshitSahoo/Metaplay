const mongoose = require('mongoose');

const gameRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  game: { type: String, required: true },
  gameType: { type: String, enum: ['tictactoe','chess','connectfour','ludo','memory','sudoku','minesweeper','2048','rps','typing','reaction','checkers','gomoku','battleship','dots'], default: 'tictactoe' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar: String,
    symbol: String,
    color: String,
    isReady: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    isConnected: { type: Boolean, default: true },
  }],
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxPlayers: { type: Number, default: 2 },
  status: { type: String, enum: ['waiting','playing','finished','abandoned'], default: 'waiting' },
  mode: { type: String, enum: ['public','private'], default: 'public' },
  gameState: { type: mongoose.Schema.Types.Mixed, default: {} },
  moves: [{ type: mongoose.Schema.Types.Mixed }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isDraw: { type: Boolean, default: false },
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  chat: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('GameRoom', gameRoomSchema);
