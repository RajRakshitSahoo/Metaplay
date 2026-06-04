const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/global', async (req, res) => {
  try {
    const users = await User.find({ isVerified: true })
      .select('username avatar level xp rank playerLevel stats')
      .sort({ xp: -1, level: -1 })
      .limit(100);
    res.json({ success: true, leaderboard: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/wins', async (req, res) => {
  try {
    const users = await User.find({ isVerified: true })
      .select('username avatar level stats rank')
      .sort({ 'stats.wins': -1 })
      .limit(50);
    res.json({ success: true, leaderboard: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
