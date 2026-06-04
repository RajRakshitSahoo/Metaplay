const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// Get or create private chat
router.get('/private/:userId', protect, async (req, res) => {
  try {
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [req.user._id, req.params.userId] },
    }).populate('participants', 'username avatar status');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, req.params.userId],
        type: 'private',
      });
      chat = await chat.populate('participants', 'username avatar status');
    }
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my chats
router.get('/my-chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id, type: 'private' })
      .populate('participants', 'username avatar status')
      .sort('-updatedAt')
      .limit(20);
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send message
router.post('/:chatId/message', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const message = {
      sender: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      content,
      readBy: [req.user._id],
    };
    chat.messages.push(message);
    chat.lastMessage = { content, sender: req.user._id, createdAt: new Date() };
    await chat.save();
    res.json({ success: true, message: chat.messages[chat.messages.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get lobby messages
router.get('/lobby', protect, async (req, res) => {
  try {
    let lobby = await Chat.findOne({ type: 'lobby' });
    if (!lobby) lobby = await Chat.create({ type: 'lobby', participants: [] });
    res.json({ success: true, messages: lobby.messages.slice(-100) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
