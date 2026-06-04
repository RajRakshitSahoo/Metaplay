import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const CONFIGS = { easy: { rows: 8, cols: 8, mines: 10 }, medium: { rows: 12, cols: 12, mines: 20 }, hard: { rows: 16, cols: 16, mines: 40 } }

function createGrid(rows, cols, mines, firstR, firstC) {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 })))
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols)
    if (!grid[r][c].mine && !(Math.abs(r-firstR) <= 1 && Math.abs(c-firstC) <= 1)) {
      grid[r][c].mine = true; placed++
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c].mine) continue
    let count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r+dr, nc = c+dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) count++
    }
    grid[r][c].count = count
  }
  return grid
}

function reveal(grid, r, c, rows, cols) {
  if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c].revealed || grid[r][c].flagged) return
  grid[r][c].revealed = true
  if (grid[r][c].count === 0 && !grid[r][c].mine) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(grid, r+dr, c+dc, rows, cols)
  }
}

const COUNT_COLORS = ['','#60A5FA','#34D399','#F87171','#A78BFA','#FB923C','#22D3EE','#F472B6','#CBD5E1']

export default function Minesweeper() {
  const [diff, setDiff] = useState('easy')
  const [grid, setGrid] = useState(null)
  const [status, setStatus] = useState('idle')
  const [started, setStarted] = useState(false)
  const [flags, setFlags] = useState(0)
  const [time, setTime] = useState(0)
  const timerRef = React.useRef(null)
  const cfg = CONFIGS[diff]

  const startTimer = () => { timerRef.current = setInterval(() => setTime(t => t + 1), 1000) }
  const stopTimer = () => { clearInterval(timerRef.current) }

  const startGame = useCallback((r, c) => {
    const g = createGrid(cfg.rows, cfg.cols, cfg.mines, r, c)
    reveal(g, r, c, cfg.rows, cfg.cols)
    setGrid(g); setStarted(true); setStatus('playing'); startTimer()
    return g
  }, [cfg])

  const handleClick = (r, c) => {
    if (status === 'won' || status === 'lost') return
    let g
    if (!started) { g = startGame(r, c); setGrid([...g.map(row => [...row])]); return }
    g = grid.map(row => row.map(cell => ({...cell})))
    if (g[r][c].flagged || g[r][c].revealed) return
    if (g[r][c].mine) {
      g.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true }))
      setGrid(g); setStatus('lost'); stopTimer()
    } else {
      reveal(g, r, c, cfg.rows, cfg.cols)
      const unrevealed = g.flat().filter(c => !c.revealed && !c.mine).length
      if (unrevealed === 0) { setStatus('won'); stopTimer() }
      setGrid(g)
    }
  }

  const handleRightClick = (e, r, c) => {
    e.preventDefault()
    if (status === 'won' || status === 'lost' || !started) return
    const g = grid.map(row => row.map(cell => ({...cell})))
    if (g[r][c].revealed) return
    g[r][c].flagged = !g[r][c].flagged
    setFlags(fl => g[r][c].flagged ? fl + 1 : fl - 1)
    setGrid(g)
  }

  const reset = (d = diff) => {
    setGrid(null); setStarted(false); setStatus('idle'); setFlags(0); setTime(0); stopTimer()
  }

  const cellSize = diff === 'hard' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <h2 className="font-cyber text-2xl font-bold text-white">MINESWEEPER</h2>
      
      <div className="flex items-center gap-3">
        {Object.keys(CONFIGS).map(d => (
          <button key={d} onClick={() => { setDiff(d); reset(d) }}
            className={`px-3 py-1 text-xs font-cyber rounded border transition-all capitalize ${diff === d ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/10 text-white/40'}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="flex gap-6 text-center">
        <div className="card-glass rounded-xl px-4 py-2">
          <div className="font-cyber text-lg text-red-400">💣 {cfg.mines - flags}</div>
          <div className="text-xs text-white/40">Mines</div>
        </div>
        <div className="card-glass rounded-xl px-4 py-2">
          <div className={`font-cyber text-lg ${status === 'won' ? 'text-green-400' : status === 'lost' ? 'text-red-400' : 'text-neon-cyan'}`}>
            {status === 'won' ? '🏆' : status === 'lost' ? '💀' : `${time}s`}
          </div>
          <div className="text-xs text-white/40">{status === 'idle' ? 'Click to start' : status === 'won' ? 'You Won!' : status === 'lost' ? 'Boom!' : 'Time'}</div>
        </div>
      </div>

      <div className="overflow-auto max-w-full">
        <div className="inline-block bg-bg-secondary rounded-xl p-2 border border-white/10">
          {(!grid ? Array(cfg.rows).fill(null).map(() => Array(cfg.cols).fill({ revealed: false, flagged: false, mine: false, count: 0 })) : grid).map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <button key={c} onClick={() => handleClick(r, c)} onContextMenu={(e) => handleRightClick(e, r, c)}
                  className={`${cellSize} flex items-center justify-center font-cyber font-bold border border-white/5 transition-all select-none
                  ${cell.revealed ? (cell.mine ? 'bg-red-500/30' : 'bg-white/3') : 'bg-white/8 hover:bg-white/15 cursor-pointer'}`}>
                  {cell.revealed ? (cell.mine ? '💥' : cell.count > 0 ? <span style={{ color: COUNT_COLORS[cell.count] }}>{cell.count}</span> : '') : cell.flagged ? '🚩' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => reset()} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
