import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const SIZE = 10
const SHIPS = [
  { name: 'Carrier', size: 5 }, { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 }, { name: 'Submarine', size: 3 }, { name: 'Destroyer', size: 2 },
]

function createEmpty() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)) }

function placeShipsRandom() {
  const grid = createEmpty()
  for (const ship of SHIPS) {
    let placed = false
    while (!placed) {
      const horiz = Math.random() > 0.5
      const row = Math.floor(Math.random() * SIZE)
      const col = Math.floor(Math.random() * SIZE)
      if (horiz && col + ship.size <= SIZE) {
        const clear = Array.from({ length: ship.size }, (_, i) => grid[row][col + i]).every(v => v === 0)
        if (clear) { for (let i = 0; i < ship.size; i++) grid[row][col + i] = 1; placed = true }
      } else if (!horiz && row + ship.size <= SIZE) {
        const clear = Array.from({ length: ship.size }, (_, i) => grid[row + i][col]).every(v => v === 0)
        if (clear) { for (let i = 0; i < ship.size; i++) grid[row + i][col] = 1; placed = true }
      }
    }
  }
  return grid
}

export default function Battleship() {
  const [playerGrid, setPlayerGrid] = useState(() => placeShipsRandom())
  const [aiGrid, setAiGrid] = useState(() => placeShipsRandom())
  const [playerHits, setPlayerHits] = useState(createEmpty())
  const [aiHits, setAiHits] = useState(createEmpty())
  const [turn, setTurn] = useState('player')
  const [status, setStatus] = useState('playing')
  const [message, setMessage] = useState('Your turn — click on enemy grid')

  const countShips = (grid, hits) => {
    let remaining = 0
    grid.forEach((row, r) => row.forEach((cell, c) => { if (cell === 1 && hits[r][c] === 0) remaining++ }))
    return remaining
  }

  const playerShoot = (r, c) => {
    if (turn !== 'player' || status !== 'playing' || playerHits[r][c] !== 0) return
    const newHits = playerHits.map(row => [...row])
    const hit = aiGrid[r][c] === 1
    newHits[r][c] = hit ? 2 : 1
    setPlayerHits(newHits)
    if (countShips(aiGrid, newHits) === 0) { setStatus('won'); setMessage('🎉 You win! All enemy ships sunk!'); return }
    setMessage(hit ? '💥 Hit! AI\'s turn...' : '💧 Miss! AI\'s turn...')
    setTurn('ai')
    setTimeout(() => aiTurn(newHits), 800)
  }

  const aiTurn = (phits) => {
    const available = []
    aiHits.forEach((row, r) => row.forEach((v, c) => { if (v === 0) available.push([r, c]) }))
    if (!available.length) return
    const [r, c] = available[Math.floor(Math.random() * available.length)]
    const newAiHits = aiHits.map(row => [...row])
    const hit = playerGrid[r][c] === 1
    newAiHits[r][c] = hit ? 2 : 1
    setAiHits(newAiHits)
    if (countShips(playerGrid, newAiHits) === 0) { setStatus('lost'); setMessage('💀 AI wins! Your fleet is destroyed!'); return }
    setMessage(hit ? '💥 AI hit your ship! Your turn.' : '💧 AI missed! Your turn.')
    setTurn('player')
  }

  const reset = () => {
    setPlayerGrid(placeShipsRandom()); setAiGrid(placeShipsRandom())
    setPlayerHits(createEmpty()); setAiHits(createEmpty())
    setTurn('player'); setStatus('playing'); setMessage('Your turn — click on enemy grid')
  }

  const CellColor = (gridVal, hitVal, isEnemy) => {
    if (hitVal === 2) return 'bg-red-500/60 border-red-400/70'
    if (hitVal === 1) return 'bg-blue-400/30 border-blue-400/20'
    if (!isEnemy && gridVal === 1) return 'bg-neon-cyan/20 border-neon-cyan/30'
    return 'bg-white/3 border-white/5 hover:bg-white/10'
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <h2 className="font-cyber text-2xl font-bold text-white">BATTLESHIP</h2>
      <div className={`font-cyber text-sm text-center ${status === 'won' ? 'text-neon-cyan' : status === 'lost' ? 'text-red-400' : 'text-white/60'}`}>{message}</div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Player grid */}
        <div>
          <div className="text-xs font-cyber text-white/40 mb-2 text-center">YOUR FLEET</div>
          <div className="border border-neon-cyan/20 rounded-xl overflow-hidden p-1 bg-bg-secondary">
            {playerGrid.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => (
                  <div key={c} className={`w-7 h-7 border text-xs flex items-center justify-center ${CellColor(cell, aiHits[r][c], false)}`}>
                    {aiHits[r][c] === 2 ? '💥' : aiHits[r][c] === 1 ? '·' : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* AI grid */}
        <div>
          <div className="text-xs font-cyber text-red-400/60 mb-2 text-center">ENEMY WATERS</div>
          <div className="border border-red-400/20 rounded-xl overflow-hidden p-1 bg-bg-secondary">
            {aiGrid.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => (
                  <div key={c} onClick={() => playerShoot(r, c)}
                    className={`w-7 h-7 border text-xs flex items-center justify-center cursor-pointer transition-all ${CellColor(0, playerHits[r][c], true)}`}>
                    {playerHits[r][c] === 2 ? '💥' : playerHits[r][c] === 1 ? '·' : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {status !== 'playing' && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={reset} className="btn-neon text-sm py-2.5 px-8">
          🔄 New Game
        </motion.button>
      )}
    </div>
  )
}
