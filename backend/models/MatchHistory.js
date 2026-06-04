const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
  game: { type: String, required: true },
  roomCode: String,
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar: String,
    score: Number,
    result: { type: String, enum: ['win','loss','draw'] },
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isDraw: { type: Boolean, default: false },
  moves: [{ type: mongoose.Schema.Types.Mixed }],
  finalState: { type: mongoose.Schema.Types.Mixed },
  duration: Number,
  xpAwarded: { type: Number, default: 0 },
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },
}, { timestamps: true });

module.exports = mongoose.model('MatchHistory', matchHistorySchema);
