const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const tournaments = await Tournament.find().populate('host', 'username avatar').sort('-createdAt').limit(20);
  res.json({ success: true, tournaments });
});

router.post('/create', protect, async (req, res) => {
  try {
    const { name, game, type, maxParticipants, prizeXP, description, startDate } = req.body;
    const tournament = await Tournament.create({
      name, game, type, maxParticipants: maxParticipants || 8,
      prizeXP: prizeXP || 500, description, startDate,
      host: req.user._id,
      participants: [{ user: req.user._id, username: req.user.username, avatar: req.user.avatar }],
    });
    res.status(201).json({ success: true, tournament });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/join', protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
    if (tournament.participants.length >= tournament.maxParticipants)
      return res.status(400).json({ success: false, message: 'Tournament full' });
    
    const alreadyIn = tournament.participants.find(p => p.user.toString() === req.user._id.toString());
    if (alreadyIn) return res.status(400).json({ success: false, message: 'Already joined' });

    tournament.participants.push({ user: req.user._id, username: req.user.username, avatar: req.user.avatar });
    await tournament.save();
    res.json({ success: true, tournament });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('host', 'username avatar').populate('winner', 'username avatar');
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
    res.json({ success: true, tournament });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
