import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const SIZE = 4

function createEmpty() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)) }

function addRandom(grid) {
  const empty = []
  grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]) }))
  if (!empty.length) return grid
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const newGrid = grid.map(row => [...row])
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4
  return newGrid
}

function initGrid() { return addRandom(addRandom(createEmpty())) }

function slide(row) {
  const nums = row.filter(Boolean)
  let score = 0
  const merged = []
  let i = 0
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      merged.push(nums[i] * 2)
      score += nums[i] * 2
      i += 2
    } else { merged.push(nums[i]); i++ }
  }
  while (merged.length < SIZE) merged.push(0)
  return { row: merged, score }
}

function move(grid, dir) {
  let newGrid = grid.map(row => [...row])
  let totalScore = 0, changed = false

  const transpose = (g) => g[0].map((_, c) => g.map(r => r[c]))
  const reverse = (g) => g.map(r => [...r].reverse())

  if (dir === 'ArrowUp') newGrid = transpose(newGrid)
  if (dir === 'ArrowRight') newGrid = reverse(newGrid)
  if (dir === 'ArrowDown') { newGrid = transpose(newGrid); newGrid = reverse(newGrid) }

  newGrid = newGrid.map(row => {
    const { row: newRow, score } = slide(row)
    totalScore += score
    if (newRow.join(',') !== row.join(',')) changed = true
    return newRow
  })

  if (dir === 'ArrowUp') newGrid = transpose(newGrid)
  if (dir === 'ArrowRight') newGrid = reverse(newGrid)
  if (dir === 'ArrowDown') { newGrid = reverse(newGrid); newGrid = transpose(newGrid) }

  return { grid: newGrid, score: totalScore, changed }
}

function isGameOver(grid) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!grid[r][c]) return false
    if (r + 1 < SIZE && grid[r][c] === grid[r+1][c]) return false
    if (c + 1 < SIZE && grid[r][c] === grid[r][c+1]) return false
  }
  return true
}

const TILE_COLORS = {
  0:'transparent', 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563',
  32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72', 256:'#edcc61', 512:'#edc850',
  1024:'#edc53f', 2048:'#edc22e', 4096:'#00F5FF', 8192:'#FF00FF',
}
const TILE_TEXT = (v) => v >= 128 ? '#f9f6f2' : v > 4 ? '#f9f6f2' : '#776e65'

export default function Game2048() {
  const [grid, setGrid] = useState(initGrid)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [won, setWon] = useState(false)

  const handleKey = useCallback((e) => {
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return
    e.preventDefault()
    if (over) return
    const { grid: newGrid, score: addScore, changed } = move(grid, e.key)
    if (!changed) return
    const withNew = addRandom(newGrid)
    setGrid(withNew)
    const ns = score + addScore
    setScore(ns)
    setBest(b => Math.max(b, ns))
    if (withNew.flat().includes(2048) && !won) setWon(true)
    if (isGameOver(withNew)) setOver(true)
  }, [grid, score, over, won])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const reset = () => { setGrid(initGrid()); setScore(0); setOver(false); setWon(false) }

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center justify-between w-72">
        <h2 className="font-cyber text-2xl font-bold text-white">2048</h2>
        <div className="flex gap-2">
          <div className="card-glass rounded-xl px-4 py-2 text-center">
            <div className="font-cyber text-sm text-neon-cyan">{score}</div>
            <div className="text-xs text-white/40">Score</div>
          </div>
          <div className="card-glass rounded-xl px-4 py-2 text-center">
            <div className="font-cyber text-sm text-neon-yellow">{best}</div>
            <div className="text-xs text-white/40">Best</div>
          </div>
        </div>
      </div>

      {(over || won) && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={`card-glass rounded-xl px-6 py-3 text-center border ${won ? 'border-neon-yellow/50' : 'border-red-400/50'}`}>
          <div className="font-cyber font-bold" style={{ color: won ? '#FFD700' : '#FF6B6B' }}>
            {won ? '🏆 YOU WIN!' : '💀 Game Over'}
          </div>
          <div className="text-white/50 text-xs font-body">Score: {score}</div>
        </motion.div>
      )}

      <div className="bg-bg-secondary rounded-2xl p-3 border border-white/10">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
          {grid.flat().map((val, i) => (
            <motion.div key={i} layout
              className="w-16 h-16 rounded-xl flex items-center justify-center font-cyber font-bold text-lg"
              style={{ background: TILE_COLORS[val] || TILE_COLORS[4096], color: TILE_TEXT(val),
                boxShadow: val >= 2048 ? '0 0 15px rgba(0,245,255,0.5)' : 'none' }}>
              {val || ''}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-white/30 text-xs font-body text-center">Use arrow keys to play</div>
      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
