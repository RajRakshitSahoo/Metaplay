const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
    
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ success: false, message: 'Username or email already exists' });

    // Generate avatar
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const user = await User.create({ username, email, password, avatar, isVerified: true });

    // Daily login XP
    await user.addXP(10, 'registration');

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id, username: user.username, email: user.email,
        avatar: user.avatar, level: user.level, xp: user.xp,
        rank: user.rank, playerLevel: user.playerLevel, stats: user.stats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Daily login XP
    const today = new Date().toDateString();
    if (!user.lastLoginDate || new Date(user.lastLoginDate).toDateString() !== today) {
      user.lastLoginDate = new Date();
      user.loginStreak = (user.loginStreak || 0) + 1;
      await user.addXP(20, 'daily_login');
    }

    user.status = 'online';
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id, username: user.username, email: user.email,
        avatar: user.avatar, banner: user.banner, bio: user.bio,
        level: user.level, xp: user.xp, xpToNextLevel: user.xpToNextLevel,
        rank: user.rank, playerLevel: user.playerLevel, stats: user.stats,
        achievements: user.achievements, friends: user.friends,
        theme: user.theme, boardTheme: user.boardTheme, loginStreak: user.loginStreak,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('achievements')
    .populate('friends', 'username avatar status level rank');
  res.json({ success: true, user });
});

// Logout
router.post('/logout', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { status: 'offline', lastSeen: new Date() });
  res.json({ success: true, message: 'Logged out' });
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, avatar, banner, theme, boardTheme } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { bio, avatar, banner, theme, boardTheme }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
