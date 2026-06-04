const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Send friend request
router.post('/request/:userId', protect, async (req, res) => {
  try {
    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    
    const alreadyFriends = req.user.friends.includes(req.params.userId);
    if (alreadyFriends) return res.status(400).json({ success: false, message: 'Already friends' });

    const existingReq = target.friendRequests.find(r => r.from.toString() === req.user._id.toString());
    if (existingReq) return res.status(400).json({ success: false, message: 'Request already sent' });

    target.friendRequests.push({ from: req.user._id, status: 'pending' });
    await target.save();

    await Notification.create({
      user: target._id,
      type: 'friend_request',
      title: 'Friend Request',
      message: `${req.user.username} sent you a friend request`,
      data: { fromUser: req.user._id, username: req.user.username },
    });

    res.json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Accept/reject friend request
router.put('/request/:userId/:action', protect, async (req, res) => {
  try {
    const { action } = req.params;
    const user = await User.findById(req.user._id);
    const reqIndex = user.friendRequests.findIndex(r => r.from.toString() === req.params.userId);
    if (reqIndex === -1) return res.status(404).json({ success: false, message: 'Request not found' });

    if (action === 'accept') {
      user.friends.push(req.params.userId);
      const sender = await User.findById(req.params.userId);
      if (sender) { sender.friends.push(req.user._id); await sender.save(); }
      user.friendRequests[reqIndex].status = 'accepted';
    } else {
      user.friendRequests[reqIndex].status = 'rejected';
    }
    await user.save();
    res.json({ success: true, message: `Request ${action}ed` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get friends list
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username avatar status level rank lastSeen');
    res.json({ success: true, friends: user.friends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get friend requests
router.get('/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests.from', 'username avatar level rank');
    const pending = user.friendRequests.filter(r => r.status === 'pending');
    res.json({ success: true, requests: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Remove friend
router.delete('/:userId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $pull: { friends: req.user._id } });
    res.json({ success: true, message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
