const jwt = require('jsonwebtoken')
const User = require('../models/User')
const GameRoom = require('../models/GameRoom')
const MatchHistory = require('../models/MatchHistory')
const Notification = require('../models/Notification')
const Chat = require('../models/Chat')

const userSockets = new Map() // userId -> socketId

module.exports = (io) => {
  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) return next(new Error('Authentication required'))
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'metaplay_secret')
      const user = await User.findById(decoded.id).select('-password')
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    const user = socket.user
    console.log(`🎮 ${user.username} connected [${socket.id}]`)

    userSockets.set(user._id.toString(), socket.id)
    await User.findByIdAndUpdate(user._id, { status: 'online', socketId: socket.id })
    socket.join(`user:${user._id}`)
    io.emit('user:online', { userId: user._id, username: user.username })

    // ── ROOM EVENTS ───────────────────────────────────────────
    socket.on('room:join', async ({ roomCode }) => {
      try {
        let room = await GameRoom.findOne({ roomCode })
          .populate('players.user', 'username avatar level rank')
          .populate('host', 'username avatar')

        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        const userId = user._id.toString()
        const alreadyIn = room.players.some(p => (p.user?._id || p.user)?.toString() === userId)

        if (!alreadyIn) {
          if (room.status !== 'waiting') {
            socket.emit('error', { message: 'Game already started' })
            return
          }
          if (room.players.length >= room.maxPlayers) {
            socket.emit('error', { message: 'Room is full' })
            return
          }
          room.players.push({
            user: user._id,
            username: user.username,
            avatar: user.avatar,
            isReady: false,
            score: 0,
            isConnected: true,
          })
          await room.save()
          room = await GameRoom.findOne({ roomCode })
            .populate('players.user', 'username avatar level rank')
            .populate('host', 'username avatar')
        } else {
          // Mark as reconnected
          const idx = room.players.findIndex(p => (p.user?._id || p.user)?.toString() === userId)
          if (idx !== -1) { room.players[idx].isConnected = true; await room.save() }
        }

        socket.join(`room:${roomCode}`)
        socket.emit('room:joined', room)
        io.to(`room:${roomCode}`).emit('room:updated', room)

        // Notify others in room
        socket.to(`room:${roomCode}`).emit('room:chat', {
          username: 'System', message: `${user.username} joined the room`, timestamp: new Date(), isSystem: true
        })
      } catch (err) {
        console.error('room:join error', err)
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    socket.on('room:ready', async ({ roomCode }) => {
      try {
        const room = await GameRoom.findOne({ roomCode })
          .populate('players.user', 'username avatar level rank')
        if (!room) return

        const idx = room.players.findIndex(p =>
          (p.user?._id || p.user)?.toString() === user._id.toString()
        )
        if (idx !== -1) { room.players[idx].isReady = true; await room.save() }

        io.to(`room:${roomCode}`).emit('room:updated', room)

        // Check if all players are ready
        const allReady = room.players.length >= 2 && room.players.every(p => p.isReady)
        if (allReady && room.status === 'waiting') {
          room.status = 'playing'
          room.startedAt = new Date()
          await room.save()
          io.to(`room:${roomCode}`).emit('game:start', { room })
          io.to(`room:${roomCode}`).emit('game:started', { roomCode })
        }
      } catch (err) {
        console.error('room:ready error', err)
      }
    })

    socket.on('room:leave', async ({ roomCode }) => {
      try {
        socket.leave(`room:${roomCode}`)
        const room = await GameRoom.findOne({ roomCode })
        if (!room) return

        const userId = user._id.toString()
        room.players = room.players.filter(p =>
          (p.user?._id || p.user)?.toString() !== userId
        )

        if (room.players.length === 0) {
          room.status = 'abandoned'
        } else if (room.host?.toString() === userId && room.players.length > 0) {
          room.host = room.players[0].user
        }
        await room.save()

        io.to(`room:${roomCode}`).emit('room:updated', room)
        socket.to(`room:${roomCode}`).emit('room:chat', {
          username: 'System', message: `${user.username} left the room`, timestamp: new Date(), isSystem: true
        })
      } catch (err) {
        console.error('room:leave error', err)
      }
    })

    // ── GAME EVENTS ───────────────────────────────────────────
    socket.on('game:move', async ({ roomCode, move, gameState }) => {
      try {
        const room = await GameRoom.findOne({ roomCode })
        if (!room || room.status !== 'playing') return
        room.moves.push({ player: user._id, move, timestamp: new Date() })
        room.gameState = gameState
        await room.save()
        socket.to(`room:${roomCode}`).emit('game:move', {
          move, gameState, player: user._id, username: user.username
        })
      } catch (err) {
        console.error('game:move error', err)
      }
    })

    socket.on('game:over', async ({ roomCode, winner, isDraw, finalState, scores }) => {
      try {
        const room = await GameRoom.findOne({ roomCode }).populate('players.user')
        if (!room) return

        room.status = 'finished'
        room.endedAt = new Date()
        room.isDraw = isDraw
        if (finalState) room.gameState = finalState
        if (!isDraw && winner) room.winner = winner
        await room.save()

        const playerResults = room.players.map(p => {
          const uid = (p.user?._id || p.user)?.toString()
          const isWinner = !isDraw && uid === winner?.toString()
          return {
            user: p.user?._id || p.user,
            username: p.username,
            avatar: p.avatar,
            score: scores ? (scores[uid] || 0) : 0,
            result: isDraw ? 'draw' : isWinner ? 'win' : 'loss',
          }
        })

        await MatchHistory.create({
          game: room.game,
          roomCode,
          players: playerResults,
          winner: isDraw ? null : winner,
          isDraw,
          moves: room.moves,
          finalState,
          duration: room.startedAt ? Math.floor((new Date() - room.startedAt) / 1000) : 0,
          xpAwarded: isDraw ? 15 : 50,
        })

        // Award XP & update stats
        for (const p of playerResults) {
          if (!p.user) continue
          const u = await User.findById(p.user)
          if (!u) continue
          const xpGain = p.result === 'win' ? 50 : p.result === 'draw' ? 15 : 10
          u.stats.gamesPlayed = (u.stats.gamesPlayed || 0) + 1
          if (p.result === 'win') u.stats.wins = (u.stats.wins || 0) + 1
          else if (p.result === 'loss') u.stats.losses = (u.stats.losses || 0) + 1
          else u.stats.draws = (u.stats.draws || 0) + 1
          u.stats.winRate = u.stats.gamesPlayed > 0
            ? Math.round((u.stats.wins / u.stats.gamesPlayed) * 100) : 0
          const prevLevel = u.level
          await u.addXP(xpGain, `game_${p.result}`)
          io.to(`user:${p.user}`).emit('xp:earned', {
            amount: xpGain, reason: p.result === 'win' ? 'Victory! 🏆' : 'Match completed'
          })
          if (u.level > prevLevel) {
            io.to(`user:${p.user}`).emit('level:up', { newLevel: u.level })
          }
        }

        io.to(`room:${roomCode}`).emit('game:over', { winner, isDraw, playerResults })
      } catch (err) {
        console.error('game:over error', err)
      }
    })

    // ── CHAT EVENTS ───────────────────────────────────────────
    socket.on('lobby:message', async ({ content }) => {
      try {
        if (!content?.trim()) return
        let lobby = await Chat.findOne({ type: 'lobby' })
        if (!lobby) lobby = await Chat.create({ type: 'lobby', participants: [] })
        const msg = {
          sender: user._id, username: user.username,
          avatar: user.avatar, content: content.trim(),
          createdAt: new Date()
        }
        lobby.messages.push(msg)
        if (lobby.messages.length > 500) lobby.messages = lobby.messages.slice(-500)
        await lobby.save()
        const savedMsg = lobby.messages[lobby.messages.length - 1]
        io.emit('lobby:message', {
          _id: savedMsg._id, sender: user._id,
          username: user.username, avatar: user.avatar,
          content: content.trim(), createdAt: new Date()
        })
      } catch (err) {
        console.error('lobby:message error', err)
      }
    })

    socket.on('room:chat', async ({ roomCode, content }) => {
      const msg = {
        user: user._id, username: user.username,
        avatar: user.avatar, message: content, timestamp: new Date()
      }
      io.to(`room:${roomCode}`).emit('room:chat', msg)
    })

    socket.on('private:message', async ({ chatId, content, toUserId }) => {
      try {
        if (!content?.trim()) return
        const chat = await Chat.findById(chatId)
        if (!chat) return
        const msg = {
          sender: user._id, username: user.username,
          avatar: user.avatar, content: content.trim(),
          readBy: [user._id], createdAt: new Date()
        }
        chat.messages.push(msg)
        chat.lastMessage = { content: content.trim(), sender: user._id, createdAt: new Date() }
        await chat.save()
        const savedMsg = chat.messages[chat.messages.length - 1]

        // Send to recipient
        const targetSocketId = userSockets.get(toUserId?.toString())
        if (targetSocketId) {
          io.to(targetSocketId).emit('private:message', {
            chatId, message: { ...savedMsg.toObject(), _id: savedMsg._id }
          })
        }
        // Confirm to sender
        socket.emit('private:message:sent', {
          chatId, message: { ...savedMsg.toObject(), _id: savedMsg._id }
        })
      } catch (err) {
        console.error('private:message error', err)
      }
    })

    socket.on('typing:start', ({ chatId, toUserId }) => {
      const targetSocketId = userSockets.get(toUserId?.toString())
      if (targetSocketId) io.to(targetSocketId).emit('typing:start', { from: user.username, chatId })
    })

    socket.on('typing:stop', ({ chatId, toUserId }) => {
      const targetSocketId = userSockets.get(toUserId?.toString())
      if (targetSocketId) io.to(targetSocketId).emit('typing:stop', { from: user.username, chatId })
    })

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`👋 ${user.username} disconnected`)
      userSockets.delete(user._id.toString())
      await User.findByIdAndUpdate(user._id, { status: 'offline', lastSeen: new Date() })
      io.emit('user:offline', { userId: user._id, username: user.username })
    })
  })
}
