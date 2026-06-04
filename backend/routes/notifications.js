const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  res.json({ success: true, notifications: notifs });
});

router.put('/read/:id', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

router.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { isRead: true });
  res.json({ success: true });
});

module.exports = router;
