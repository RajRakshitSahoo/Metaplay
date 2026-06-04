import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCopy, FiUsers, FiCheck, FiArrowLeft, FiMessageSquare, FiShare2 } from 'react-icons/fi'
import Confetti from 'react-confetti'
import { getSocket } from '../utils/socket'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import sound from '../utils/gameSound'
import TicTacToe from '../games/TicTacToe'
import ConnectFour from '../games/ConnectFour'
import Chess from '../games/Chess'

export default function GameRoom() {
  const { roomCode } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const socket = getSocket()

  const [room, setRoom] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [connected, setConnected] = useState(false)
  const [joining, setJoining] = useState(true)
  const chatRef = useRef(null)
  const game = state?.game

  // Join room via socket
  useEffect(() => {
    if (!socket || !roomCode || !user) return

    const handleJoined = (r) => {
      setRoom(r)
      setJoining(false)
      setConnected(true)
      sound.button()
      // Check if already in game
      if (r.status === 'playing') setGameStarted(true)
      // Check if we already marked ready
      const me = r.players?.find(p => p.user?._id === user._id || p.user === user._id)
      if (me?.isReady) setIsReady(true)
    }
    const handleUpdated = (r) => {
      setRoom(r)
      if (r.status === 'playing') setGameStarted(true)
    }
    const handleGameStart = () => {
      setGameStarted(true)
      sound.win()
      toast.success('Game started! 🎮')
    }
    const handleChatMsg = (msg) => {
      setChatMessages(prev => [...prev, msg])
      sound.notification()
    }
    const handleGameOver = ({ winner, isDraw, playerResults }) => {
      const myResult = playerResults?.find(p =>
        p.user?.toString() === user?._id?.toString() || p.user === user?._id
      )
      setGameResult({ winner, isDraw, myResult })
      if (myResult?.result === 'win') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
        sound.win()
      } else if (isDraw) {
        sound.draw()
      } else {
        sound.lose()
      }
    }
    const handleError = ({ message: msg }) => {
      toast.error(msg)
      setJoining(false)
    }

    socket.emit('room:join', { roomCode })
    socket.on('room:joined', handleJoined)
    socket.on('room:updated', handleUpdated)
    socket.on('game:start', handleGameStart)
    socket.on('game:started', handleGameStart)
    socket.on('room:chat', handleChatMsg)
    socket.on('game:over', handleGameOver)
    socket.on('error', handleError)

    // Timeout if can't join
    const timeout = setTimeout(() => {
      if (joining) {
        setJoining(false)
        toast.error('Could not connect to room')
      }
    }, 8000)

    return () => {
      clearTimeout(timeout)
      socket.emit('room:leave', { roomCode })
      socket.off('room:joined', handleJoined)
      socket.off('room:updated', handleUpdated)
      socket.off('game:start', handleGameStart)
      socket.off('game:started', handleGameStart)
      socket.off('room:chat', handleChatMsg)
      socket.off('game:over', handleGameOver)
      socket.off('error', handleError)
    }
  }, [socket, roomCode, user])

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const toggleReady = () => {
    if (!socket || isReady) return
    sound.button()
    socket.emit('room:ready', { roomCode })
    setIsReady(true)
    toast.success('Ready! Waiting for others...')
  }

  const sendChat = () => {
    if (!chatInput.trim() || !socket) return
    socket.emit('room:chat', { roomCode, content: chatInput.trim() })
    setChatMessages(prev => [...prev, {
      username: user.username, message: chatInput.trim(), timestamp: new Date()
    }])
    setChatInput('')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    sound.button()
    toast.success(`Room code ${roomCode} copied!`)
  }

  const shareRoom = () => {
    const url = `${window.location.origin}/app/room/${roomCode}`
    if (navigator.share) {
      navigator.share({ title: 'Join my MetaPlay game!', text: `Room code: ${roomCode}`, url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Room link copied to clipboard!')
    }
  }

  const leaveRoom = () => {
    sound.button()
    socket?.emit('room:leave', { roomCode })
    navigate('/app/games')
  }

  const playAgain = () => {
    setGameResult(null)
    setGameStarted(false)
    setIsReady(false)
    setShowConfetti(false)
    sound.button()
    // Rejoin room
    socket?.emit('room:join', { roomCode })
  }

  const myPlayer = room?.players?.find(p => p.user?._id === user?._id || p.user === user?._id)
  const allReady = room?.players?.length >= 2 && room?.players?.every(p => p.isReady)
  const otherPlayers = room?.players?.filter(p => p.user?._id !== user?._id && p.user !== user?._id) || []

  // Game components
  const GAME_COMPONENTS = { tictactoe: TicTacToe, connectfour: ConnectFour, chess: Chess }
  const GameComponent = game?.id ? GAME_COMPONENTS[game.id] : null

  if (joining) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="cyber-spinner" />
      <p className="text-white/50 font-body text-sm">Connecting to room {roomCode}...</p>
    </div>
  )

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <button onClick={leaveRoom}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-body transition-colors">
          <FiArrowLeft /> Leave Room
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Room code display */}
          <div className="flex items-center gap-2 card-glass rounded-lg px-3 py-2 border border-neon-cyan/20">
            <span className="font-cyber text-xs text-white/40">ROOM</span>
            <span className="font-cyber text-sm text-neon-cyan tracking-widest font-bold">{roomCode}</span>
            <button onClick={copyCode} title="Copy code"
              className="text-white/40 hover:text-neon-cyan transition-colors ml-1">
              <FiCopy className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={shareRoom} title="Share room"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-cyber border border-white/20 text-white/60 hover:text-neon-cyan hover:border-neon-cyan/30 rounded-lg transition-all">
            <FiShare2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg border transition-all
            ${showChat ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-white/40 hover:text-white'}`}>
            <FiMessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Copy hint */}
      <div className="card-glass rounded-lg px-4 py-2 mb-4 border border-neon-yellow/20 flex items-center gap-3">
        <span className="text-neon-yellow text-sm">💡</span>
        <span className="text-white/60 text-xs font-body">
          Share room code <span className="font-cyber text-neon-cyan">{roomCode}</span> or click Share to invite a friend to join
        </span>
      </div>

      <div className="flex gap-4">
        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Players */}
          <div className="card-glass rounded-xl p-4 mb-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiUsers className="text-white/40 w-4 h-4" />
                <span className="font-cyber text-sm text-white/60">
                  {room?.players?.length || 0}/{room?.maxPlayers || 2} Players
                </span>
              </div>
              {!gameStarted && room?.status === 'waiting' && (
                <span className="text-xs font-cyber text-neon-yellow animate-pulse">
                  {room?.players?.length < (room?.maxPlayers || 2) ? '⏳ WAITING FOR PLAYERS' : allReady ? '✅ ALL READY!' : '⏳ WAITING FOR READY'}
                </span>
              )}
              {gameStarted && <span className="text-xs font-cyber text-green-400">● GAME IN PROGRESS</span>}
            </div>

            <div className="flex gap-4 flex-wrap">
              {room?.players?.map((player) => {
                const isMe = player.user?._id === user?._id || player.user === user?._id
                return (
                  <div key={player.user?._id || player.user || player.username}
                    className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                        alt="" className="w-10 h-10 rounded-full border-2"
                        style={{ borderColor: isMe ? '#00F5FF' : 'rgba(255,255,255,0.2)' }}
                        onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${player.username}` }}
                      />
                      {player.isConnected !== false && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-body font-semibold text-white text-sm">
                        {player.username} {isMe && <span className="text-neon-cyan text-xs">(You)</span>}
                      </div>
                      <div className={`text-xs font-cyber ${player.isReady ? 'text-green-400' : 'text-white/30'}`}>
                        {player.isReady ? '✓ Ready' : 'Not Ready'}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, (room?.maxPlayers || 2) - (room?.players?.length || 0)) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-2 opacity-40">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <span className="text-xs text-white/30">?</span>
                  </div>
                  <div>
                    <div className="text-xs text-white/30 font-body">Waiting for player...</div>
                    <div className="text-xs text-white/20 font-body">Share the room code above</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game result */}
          <AnimatePresence>
            {gameResult && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="card-glass rounded-2xl p-8 text-center mb-4 border border-neon-cyan/20">
                <div className="text-6xl mb-3">
                  {gameResult.isDraw ? '🤝' : gameResult.myResult?.result === 'win' ? '🏆' : '💀'}
                </div>
                <h2 className="font-cyber text-2xl font-bold mb-2"
                  style={{ color: gameResult.isDraw ? '#fbbf24' : gameResult.myResult?.result === 'win' ? '#00F5FF' : '#f87171' }}>
                  {gameResult.isDraw ? "It's a Draw!"
                    : gameResult.myResult?.result === 'win' ? '🎉 You Win!'
                    : 'You Lose!'}
                </h2>
                <p className="text-white/40 font-body text-sm mb-5">
                  {gameResult.myResult?.result === 'win' ? '+50 XP earned!' : '+10 XP for participating!'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={playAgain} className="btn-neon text-sm py-2 px-6">🔄 Play Again</button>
                  <button onClick={leaveRoom}
                    className="px-5 py-2 text-sm font-cyber border border-white/20 text-white/60 hover:text-white rounded transition-all">
                    Leave
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waiting / Ready state */}
          {!gameStarted && !gameResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card-glass rounded-2xl p-8 text-center border border-white/5">
              <div className="text-6xl mb-4">{game?.icon || '🎮'}</div>
              <h2 className="font-cyber text-2xl font-bold text-white mb-2">{game?.name || 'Game Room'}</h2>
              <p className="text-white/40 font-body text-sm mb-2">
                {room?.players?.length < (room?.maxPlayers || 2)
                  ? `Waiting for ${(room?.maxPlayers || 2) - (room?.players?.length || 0)} more player(s) to join...`
                  : allReady ? '🚀 Starting game...'
                  : 'All players connected! Click ready to start.'}
              </p>

              {room?.players?.length < (room?.maxPlayers || 2) && (
                <div className="mt-4 p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20 inline-block">
                  <p className="text-white/60 text-sm font-body mb-1">Share this code with your friend:</p>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="font-cyber text-xl text-neon-cyan tracking-widest">{roomCode}</span>
                    <button onClick={copyCode} className="text-white/40 hover:text-neon-cyan transition-colors">
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {room?.players?.length >= (room?.maxPlayers || 2) && !isReady && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={toggleReady}
                  className="btn-neon text-sm py-3 px-10 mt-4 flex items-center gap-2 mx-auto">
                  <FiCheck className="w-4 h-4" /> I'm Ready!
                </motion.button>
              )}

              {isReady && !allReady && (
                <div className="flex items-center justify-center gap-2 text-neon-cyan font-cyber text-sm mt-4">
                  <div className="cyber-spinner w-4 h-4 border-2" />
                  Waiting for others to ready up...
                </div>
              )}
            </motion.div>
          )}

          {/* Game component */}
          {gameStarted && !gameResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {GameComponent ? (
                <GameComponent />
              ) : (
                <div className="card-glass rounded-xl p-8 text-center border border-neon-cyan/20">
                  <div className="text-5xl mb-4">{game?.icon || '🎮'}</div>
                  <h3 className="font-cyber text-xl text-white mb-2">{game?.name} — Online Mode</h3>
                  <p className="text-white/40 font-body text-sm">
                    Both players are connected! Full online sync coming soon.
                  </p>
                  <p className="text-white/30 font-body text-xs mt-2">
                    Use the chat to coordinate your game moves!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="w-64 flex flex-col card-glass rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
              <div className="px-4 py-3 border-b border-white/5 font-cyber text-xs text-white/40 tracking-widest">
                ROOM CHAT
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-48 max-h-80">
                {chatMessages.length === 0 && (
                  <p className="text-white/20 text-xs font-body text-center mt-4">No messages yet</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`text-xs ${msg.username === user?.username ? 'text-right' : ''}`}>
                    <span className="text-white/30 font-body">{msg.username}: </span>
                    <span className="text-white/70 font-body">{msg.message || msg.content}</span>
                  </div>
                ))}
                <div ref={chatRef} />
              </div>
              <div className="px-3 py-2 border-t border-white/5 flex gap-2">
                <input value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  className="input-cyber text-xs flex-1 py-1.5 px-2"
                  placeholder="Message..." />
                <button onClick={sendChat}
                  className="text-neon-cyan hover:text-neon-cyan/70 transition-colors text-xs font-cyber px-1">
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
