import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiUsers, FiPlay, FiPlus } from 'react-icons/fi'
import api from '../utils/api'
import GameLobby from '../components/games/GameLobby'
import { GAME_CATEGORIES } from '../utils/constants'

export default function GamesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedGame, setSelectedGame] = useState(null)

  const { data } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get('/games/public').then(r => r.data.games),
  })

  const games = data || []
  const categories = ['all', ...Object.keys(GAME_CATEGORIES)]

  const filtered = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || g.category === activeCategory
    return matchSearch && matchCat
  })

  if (selectedGame) {
    return <GameLobby game={selectedGame} onBack={() => setSelectedGame(null)} />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-cyber text-3xl font-bold text-white mb-1">
          GAME <span className="text-neon-cyan text-neon-glow">LIBRARY</span>
        </h1>
        <p className="text-white/40 font-body text-sm">{games.length} games available across all categories</p>
      </motion.div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-cyber pl-11 w-full" placeholder="Search games..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-cyber rounded-lg border transition-all capitalize
              ${activeCategory === cat ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'}`}>
              {cat === 'all' ? '🎮 All' : `${GAME_CATEGORIES[cat]?.icon} ${GAME_CATEGORIES[cat]?.label || cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Category groups */}
      <AnimatePresence mode="wait">
        {activeCategory === 'all' ? (
          <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {Object.entries(GAME_CATEGORIES).map(([catKey, catData]) => {
              const catGames = filtered.filter(g => g.category === catKey)
              if (!catGames.length) return null
              return (
                <div key={catKey} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">{catData.icon}</span>
                    <h2 className="font-cyber text-lg font-bold" style={{ color: catData.color }}>{catData.label.toUpperCase()}</h2>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-white/30">{catGames.length} games</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {catGames.map((game, i) => (
                      <GameCard key={game.id} game={game} index={i} onClick={() => setSelectedGame(game)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} onClick={() => setSelectedGame(game)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GameCard({ game, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="card-glass rounded-xl p-5 cursor-pointer border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden"
      style={{ '--glow-color': game.color }}>
      {/* Glow background on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{ background: `radial-gradient(circle at center, ${game.color}15 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="text-4xl mb-3 text-center group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
        <h3 className="font-body font-bold text-white text-sm text-center mb-1">{game.name}</h3>
        <p className="text-xs text-white/30 text-center mb-3">{game.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-white/30">
            <FiUsers className="w-3 h-3" />
            <span>{game.minPlayers === game.maxPlayers ? game.maxPlayers : `${game.minPlayers}–${game.maxPlayers}`}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-cyber capitalize"
            style={{ background: `${game.color}20`, color: game.color }}>
            {game.category}
          </span>
        </div>
        <motion.button animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          className="w-full mt-3 py-2 text-xs font-cyber flex items-center justify-center gap-2 rounded-lg"
          style={{ background: `${game.color}25`, color: game.color, border: `1px solid ${game.color}40` }}>
          <FiPlay className="w-3 h-3" /> PLAY NOW
        </motion.button>
      </div>
    </motion.div>
  )
}
