const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['private','lobby','match'], default: 'private' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    avatar: String,
    content: String,
    type: { type: String, enum: ['text','emoji','system'], default: 'text' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
