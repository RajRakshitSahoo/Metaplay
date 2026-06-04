import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import useAuthStore from '../store/authStore'

const GAMES_PREVIEW = [
  { name: 'Chess', icon: '♟️', players: '12.4k', color: '#F59E0B' },
  { name: 'Ludo', icon: '🎲', players: '8.2k', color: '#00F5FF' },
  { name: 'Tic-Tac-Toe', icon: '⭕', players: '15.1k', color: '#FF00FF' },
  { name: 'Connect Four', icon: '🔴', players: '6.3k', color: '#FF6B6B' },
  { name: 'Sudoku', icon: '🔢', players: '4.8k', color: '#818CF8' },
  { name: 'Battleship', icon: '🚢', players: '3.2k', color: '#38BDF8' },
]

const FEATURES = [
  { icon: '🎮', title: '20+ Games', desc: 'Board, puzzle, strategy, and quick challenge games for every mood' },
  { icon: '🏆', title: 'Tournaments', desc: 'Compete in organized tournaments with real-time brackets and prizes' },
  { icon: '👥', title: 'Multiplayer', desc: 'Play with friends or challenge players worldwide in real-time' },
  { icon: '📊', title: 'Analytics', desc: 'Deep stats, match history, and performance insights' },
  { icon: '🏅', title: 'Achievements', desc: 'Unlock badges and rewards as you progress through your journey' },
  { icon: '💬', title: 'Live Chat', desc: 'Lobby chat, private messages, and in-game communication' },
]

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'CyberKnight', level: 87, xp: 48200, wins: 342 },
  { rank: 2, name: 'NeonStrike', level: 82, xp: 45100, wins: 298 },
  { rank: 3, name: 'VoidRunner', level: 79, xp: 41800, wins: 276 },
  { rank: 4, name: 'PixelHawk', level: 75, xp: 38500, wins: 251 },
  { rank: 5, name: 'GlitchMaster', level: 71, xp: 35200, wins: 234 },
]

const Particle = ({ style }) => (
  <div className="particle" style={{ width: 4, height: 4, background: style.color, left: style.left, bottom: 0, animationDuration: style.duration, animationDelay: style.delay }} />
)

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [onlineCount] = useState(Math.floor(Math.random() * 5000) + 8000)
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3])

  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i / 20) * 100}%`,
    color: ['#00F5FF', '#7C3AED', '#FF00FF', '#F59E0B'][i % 4],
    duration: `${6 + Math.random() * 6}s`,
    delay: `${Math.random() * 6}s`,
  }))

  useEffect(() => {
    if (isAuthenticated) navigate('/app')
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-bg-primary text-white overflow-x-hidden cyber-bg relative">
      {/* Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl font-bold shadow-lg glow-cyan">M</div>
          <span className="font-cyber text-xl font-bold text-neon-cyan text-neon-glow">META<span className="text-white">PLAY</span></span>
        </motion.div>
        <div className="hidden md:flex items-center gap-8 text-sm font-body font-semibold text-white/60">
          {['Games', 'Tournaments', 'Leaderboard', 'Community'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-neon-cyan transition-colors">{item}</a>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-cyber text-white/70 hover:text-neon-cyan transition-colors">Login</Link>
          <Link to="/register" className="btn-neon text-xs py-2.5">Play Now</Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        {/* Glowing orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-xs font-cyber tracking-widest mb-6">
          <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
          {onlineCount.toLocaleString()} PLAYERS ONLINE NOW
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="font-cyber text-5xl md:text-8xl font-black leading-none mb-4">
          <span className="text-white">META</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink">PLAY</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="font-cyber text-lg md:text-2xl text-white/60 tracking-[0.3em] mb-2">
          PLAY. COMPETE. CONQUER.
        </motion.p>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-white/40 text-base max-w-xl mb-10 font-body">
          The ultimate multiplayer gaming ecosystem. Challenge players worldwide, climb the ranks, and build your gaming legacy.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/register" className="btn-neon text-sm px-8 py-4 glow-cyan">
            🚀 Start Playing Free
          </Link>
          <Link to="/login" className="px-8 py-4 text-sm font-cyber border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-all">
            Sign In →
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-8 md:gap-16">
          {[{ num: '20+', label: 'Games' }, { num: '50K+', label: 'Players' }, { num: '1M+', label: 'Matches' }].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-cyber text-3xl md:text-4xl font-bold text-neon-cyan text-neon-glow">{s.num}</div>
              <div className="text-white/40 text-sm font-body mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Featured Games */}
      <section id="games" className="relative z-10 py-24 px-6 md:px-16">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="font-cyber text-3xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">FEATURED</span> GAMES
          </h2>
          <p className="text-white/40 font-body">20+ games across all categories</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {GAMES_PREVIEW.map((game, i) => (
            <motion.div key={game.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, y: -5 }}
              className="card-glass p-4 text-center cursor-pointer group"
              style={{ '--hover-color': game.color }}>
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{game.icon}</div>
              <div className="font-cyber text-sm font-bold text-white mb-1">{game.name}</div>
              <div className="text-xs text-white/40">{game.players} online</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mt-10">
          <Link to="/register" className="text-neon-cyan font-cyber text-sm hover:text-neon-cyan/80 transition-colors">
            View all 20+ games →
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6 md:px-16 bg-bg-secondary/30">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="font-cyber text-3xl md:text-5xl font-bold mb-4">
            EVERYTHING YOU <span className="text-neon-cyan text-neon-glow">NEED</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-glow p-6 rounded-xl">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-cyber text-lg font-bold text-neon-cyan mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm font-body leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="relative z-10 py-24 px-6 md:px-16">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="font-cyber text-3xl md:text-5xl font-bold mb-4">
              TOP <span className="text-neon-yellow text-neon-glow">LEGENDS</span>
            </h2>
          </motion.div>

          <div className="card-glass rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-cyber text-xs text-white/50 tracking-widest">GLOBAL LEADERBOARD</span>
              <span className="text-xs text-neon-cyan font-cyber">LIVE</span>
            </div>
            {LEADERBOARD_PREVIEW.map((player, i) => (
              <motion.div key={player.rank} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-cyber font-bold text-sm ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-white/5 text-white/40'}`}>
                  {player.rank}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/20" />
                <div className="flex-1">
                  <div className="font-body font-bold text-white">{player.name}</div>
                  <div className="text-xs text-white/40">Level {player.level}</div>
                </div>
                <div className="text-right">
                  <div className="font-cyber text-sm text-neon-cyan">{player.xp.toLocaleString()} XP</div>
                  <div className="text-xs text-white/40">{player.wins} wins</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 md:px-16 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/10 to-neon-pink/5" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative max-w-3xl mx-auto">
          <h2 className="font-cyber text-4xl md:text-6xl font-black mb-6">
            READY TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">DOMINATE?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 font-body">Join thousands of players already competing on MetaPlay</p>
          <Link to="/register" className="btn-neon text-base px-12 py-5 glow-cyan inline-block">
            🎮 Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-cyber text-neon-cyan font-bold">METAPLAY</span>
          <span className="text-white/20 text-xs">© 2025</span>
        </div>
        <div className="text-white/30 text-xs font-body">Play. Compete. Conquer. — The ultimate gaming ecosystem</div>
      </footer>
    </div>
  )
}
