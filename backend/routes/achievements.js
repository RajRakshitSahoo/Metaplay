// achievements.js
const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const achievements = await Achievement.find();
  res.json({ success: true, achievements });
});

module.exports = router;
