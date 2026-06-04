const express = require('express')
const router = express.Router()
const MatchHistory = require('../models/MatchHistory')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// Get my match history
router.get('/me', protect, async (req, res) => {
  try {
    const matches = await MatchHistory.find({
      'players.user': req.user._id
    }).sort('-createdAt').limit(50)
    res.json({ success: true, matches })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Get another user's match history
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const matches = await MatchHistory.find({
      'players.user': req.params.userId
    }).sort('-createdAt').limit(30)
    res.json({ success: true, matches })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Save a solo/local game result (called from frontend)
router.post('/save', protect, async (req, res) => {
  try {
    const { game, result, score, duration, opponent } = req.body
    const isWin = result === 'win'
    const isLoss = result === 'loss'
    const isDraw = result === 'draw'

    const players = [{
      user: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      score: score || 0,
      result: result || 'unknown',
    }]

    if (opponent) {
      players.push({
        username: opponent,
        score: 0,
        result: isWin ? 'loss' : isLoss ? 'win' : 'draw',
      })
    }

    const xpAwarded = isWin ? 50 : isDraw ? 15 : 10

    const match = await MatchHistory.create({
      game,
      players,
      winner: isWin ? req.user._id : null,
      isDraw,
      duration: duration || 0,
      xpAwarded,
    })

    // Update user stats
    const user = await User.findById(req.user._id)
    if (user) {
      user.stats.gamesPlayed = (user.stats.gamesPlayed || 0) + 1
      if (isWin) user.stats.wins = (user.stats.wins || 0) + 1
      else if (isLoss) user.stats.losses = (user.stats.losses || 0) + 1
      else user.stats.draws = (user.stats.draws || 0) + 1
      user.stats.winRate = user.stats.gamesPlayed > 0
        ? Math.round((user.stats.wins / user.stats.gamesPlayed) * 100) : 0
      if (!user.stats.favoriteGame) user.stats.favoriteGame = game
      await user.addXP(xpAwarded, `game_${result}`)
    }

    res.status(201).json({ success: true, match, xpAwarded })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
