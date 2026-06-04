const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('achievements')
      .populate('friends', 'username avatar status level rank');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Search users
router.get('/search/:query', protect, async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.query, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('username avatar level rank status').limit(10);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get online users
router.get('/status/online', protect, async (req, res) => {
  try {
    const users = await User.find({ status: 'online', _id: { $ne: req.user._id } })
      .select('username avatar level rank status').limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
