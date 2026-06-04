const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  game: { type: String, required: true },
  type: { type: String, enum: ['single_elimination','double_elimination','league'], default: 'single_elimination' },
  status: { type: String, enum: ['upcoming','registration','active','finished'], default: 'upcoming' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar: String,
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    isEliminated: { type: Boolean, default: false },
  }],
  maxParticipants: { type: Number, default: 8 },
  bracket: [{ type: mongoose.Schema.Types.Mixed }],
  currentRound: { type: Number, default: 1 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  prizeXP: { type: Number, default: 500 },
  startDate: Date,
  endDate: Date,
  description: String,
  banner: String,
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
