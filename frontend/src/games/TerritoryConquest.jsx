import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

const GRID = 8
const COLORS = { 0: 'transparent', 1: '#00F5FF', 2: '#FF00FF', 3: '#F59E0B', 4: '#34D399' }
const PLAYER_COLORS = { 1: '#00F5FF', 2: '#FF00FF' }

function initBoard() {
  const b = Array(GRID).fill(null).map(() => Array(GRID).fill(0))
  // Starting positions
  b[0][0] = 1; b[0][1] = 1; b[1][0] = 1
  b[GRID-1][GRID-1] = 2; b[GRID-1][GRID-2] = 2; b[GRID-2][GRID-1] = 2
  return b
}

function getAdjacentCells(board, player) {
  const opp = player === 1 ? 2 : 1
  const cells = new Set()
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (board[r][c] === player) {
        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const nr = r+dr, nc = c+dc
          if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && board[nr][nc] !== player)
            cells.add(`${nr},${nc}`)
        }
      }
    }
  }
  return [...cells].map(k => k.split(',').map(Number))
}

function countCells(board, player) {
  return board.flat().filter(c => c === player).length
}

export default function TerritoryConquest() {
  const [board, setBoard] = useState(initBoard)
  const [turn, setTurn] = useState(1)
  const [scores, setScores] = useState({ 1: 3, 2: 3 })
  const [winner, setWinner] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [vsAI, setVsAI] = useState(true)
  const [selected, setSelected] = useState(null)
  const [movesLeft, setMovesLeft] = useState(3)
  const [message, setMessage] = useState("Your turn! Expand your territory (3 moves)")
  const [aiThinking, setAiThinking] = useState(false)

  const adjacent = getAdjacentCells(board, turn)
  const adjacentSet = new Set(adjacent.map(([r,c]) => `${r},${c}`))

  const doMove = useCallback((r, c, currentBoard, currentTurn, currentMovesLeft) => {
    if (currentBoard[r][c] === currentTurn) return
    const nb = currentBoard.map(row => [...row])
    nb[r][c] = currentTurn

    // Capture adjacent opponent cells
    const opp = currentTurn === 1 ? 2 : 1
    let captured = 0
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r+dr, nc = c+dc
      if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && nb[nr][nc] === opp) {
        // Check if opponent cell is isolated (has no other adjacent ally)
        const oppAdj = [[-1,0],[1,0],[0,-1],[0,1]].filter(([ddr,ddc]) => {
          const ar = nr+ddr, ac = nc+ddc
          return ar >= 0 && ar < GRID && ac >= 0 && ac < GRID && nb[ar][ac] === opp && !(ar===r&&ac===c)
        })
        if (oppAdj.length === 0) { nb[nr][nc] = currentTurn; captured++ }
      }
    }

    const newScores = { 1: countCells(nb, 1), 2: countCells(nb, 2) }
    const remaining = currentMovesLeft - 1
    setBoard(nb); setScores(newScores)

    // Check if board full
    const empty = nb.flat().filter(c => c === 0).length
    if (empty === 0) {
      const w = newScores[1] > newScores[2] ? 1 : 2
      setWinner(w)
      if (w === 1) setShowConfetti(true)
      return nb
    }

    if (remaining <= 0) {
      const next = currentTurn === 1 ? 2 : 1
      setTurn(next); setMovesLeft(3)
      setMessage(next === 1 ? "Your turn! Expand territory (3 moves)" : vsAI ? "AI's turn..." : "P2's turn (3 moves)")
      if (vsAI && next === 2) {
        setAiThinking(true)
        setTimeout(() => doAITurns(nb, newScores, 3), 500)
      }
    } else {
      setMovesLeft(remaining)
      setMessage(`Your turn! ${remaining} move${remaining > 1 ? 's' : ''} left`)
    }
    return nb
  }, [vsAI])

  const doAITurns = useCallback((currentBoard, currentScores, movesLeft) => {
    if (movesLeft <= 0) {
      setTurn(1); setMovesLeft(3); setAiThinking(false)
      setMessage("Your turn! Expand territory (3 moves)")
      return
    }
    const adj = getAdjacentCells(currentBoard, 2)
    if (adj.length === 0) { setTurn(1); setMovesLeft(3); setAiThinking(false); return }

    // AI strategy: capture cells adjacent to opponent or expand most
    let best = adj[0], bestScore = -1
    for (const [r, c] of adj) {
      let score = 0
      if (currentBoard[r][c] === 1) score += 5 // capture opponent
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r+dr, nc = c+dc
        if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && currentBoard[nr][nc] === 1) score += 2
        if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && currentBoard[nr][nc] === 0) score += 1
      }
      score += Math.random() * 0.5
      if (score > bestScore) { bestScore = score; best = [r, c] }
    }

    const [r, c] = best
    const nb = currentBoard.map(row => [...row])
    nb[r][c] = 2
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r+dr, nc = c+dc
      if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && nb[nr][nc] === 1) {
        const adj1 = [[-1,0],[1,0],[0,-1],[0,1]].filter(([ddr,ddc]) => {
          const ar=nr+ddr,ac=nc+ddc
          return ar>=0&&ar<GRID&&ac>=0&&ac<GRID&&nb[ar][ac]===1&&!(ar===r&&ac===c)
        })
        if (adj1.length === 0) nb[nr][nc] = 2
      }
    }
    const ns = { 1: countCells(nb, 1), 2: countCells(nb, 2) }
    setBoard(nb); setScores(ns)
    const empty = nb.flat().filter(c => c === 0).length
    if (empty === 0) {
      const w = ns[1] > ns[2] ? 1 : 2
      setWinner(w); setAiThinking(false)
      if (w === 1) setShowConfetti(true)
      return
    }
    setTimeout(() => doAITurns(nb, ns, movesLeft - 1), 400)
  }, [])

  const handleClick = (r, c) => {
    if (winner || aiThinking || (vsAI && turn === 2)) return
    if (!adjacentSet.has(`${r},${c}`) && board[r][c] !== 0) return
    if (board[r][c] === turn) return
    if (!adjacentSet.has(`${r},${c}`)) return
    doMove(r, c, board, turn, movesLeft)
  }

  const reset = () => {
    setBoard(initBoard()); setTurn(1); setScores({ 1: 3, 2: 3 })
    setWinner(null); setShowConfetti(false); setMovesLeft(3); setAiThinking(false)
    setMessage("Your turn! Expand your territory (3 moves)")
  }

  const CELL = 52

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {showConfetti && <Confetti recycle={false} />}

      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">TERRITORY CONQUEST</h2>
        <button onClick={() => { setVsAI(!vsAI); reset() }}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2P'}
        </button>
      </div>

      <div className="flex gap-4">
        {[[1,'You','#00F5FF'],[2,vsAI?'AI':'P2','#FF00FF']].map(([p,lbl,col]) => (
          <div key={p} className="card-glass rounded-xl px-5 py-2 text-center border-2 transition-all"
            style={{ borderColor: turn===p&&!winner ? col : 'transparent' }}>
            <div className="font-cyber text-xl font-bold" style={{ color: col }}>{scores[p]}</div>
            <div className="text-xs text-white/40">{lbl}</div>
            <div className="text-xs text-white/20">{Math.round(scores[p]/(GRID*GRID)*100)}%</div>
          </div>
        ))}
        <div className="card-glass rounded-xl px-4 py-2 text-center">
          <div className="font-cyber text-xl text-white">{board.flat().filter(c=>c===0).length}</div>
          <div className="text-xs text-white/40">Empty</div>
        </div>
      </div>

      <div className="text-sm font-body text-center min-h-5">
        {winner
          ? <span className="font-cyber" style={{ color: PLAYER_COLORS[winner] }}>
              🏆 {winner === 1 ? 'You Win!' : vsAI ? 'AI Wins!' : 'P2 Wins!'}
            </span>
          : <span className="text-white/60">{message}</span>
        }
      </div>

      {/* Board */}
      <div className="border-2 border-white/10 rounded-xl overflow-hidden shadow-2xl"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, ${CELL}px)` }}>
        {board.map((row, r) => row.map((cell, c) => {
          const isAdj = adjacentSet.has(`${r},${c}`)
          const canClick = isAdj && !winner && !(vsAI && turn===2) && !aiThinking
          return (
            <motion.div key={`${r}-${c}`}
              whileHover={canClick ? { scale: 1.05, zIndex: 10 } : {}}
              onClick={() => handleClick(r, c)}
              className="relative flex items-center justify-center transition-all border border-white/5"
              style={{
                width: CELL, height: CELL,
                background: cell === 1 ? 'rgba(0,245,255,0.25)' : cell === 2 ? 'rgba(255,0,255,0.25)' : 'rgba(255,255,255,0.03)',
                cursor: canClick ? 'pointer' : 'default',
                boxShadow: cell === 1 ? 'inset 0 0 8px rgba(0,245,255,0.3)' : cell === 2 ? 'inset 0 0 8px rgba(255,0,255,0.3)' : 'none',
              }}>
              {cell !== 0 && (
                <div className="w-4 h-4 rounded-full shadow-lg"
                  style={{ background: PLAYER_COLORS[cell], boxShadow: `0 0 6px ${PLAYER_COLORS[cell]}` }} />
              )}
              {isAdj && cell === 0 && canClick && (
                <div className="w-3 h-3 rounded-full border-2 opacity-60"
                  style={{ borderColor: PLAYER_COLORS[turn] }} />
              )}
              {isAdj && cell !== 0 && cell !== turn && canClick && (
                <div className="absolute inset-0 border-2 opacity-60 animate-pulse"
                  style={{ borderColor: PLAYER_COLORS[turn] }} />
              )}
            </motion.div>
          )
        }))}
      </div>

      <p className="text-xs text-white/30 font-body text-center max-w-xs">
        Click adjacent cells to expand. Capture isolated enemy cells. Each turn you get 3 moves.
      </p>

      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
