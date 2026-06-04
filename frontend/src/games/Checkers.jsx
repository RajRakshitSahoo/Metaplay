import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

const SIZE = 8

function initBoard() {
  const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null))
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < SIZE; c++)
      if ((r + c) % 2 === 1) board[r][c] = { color: 'b', king: false }
  for (let r = 5; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if ((r + c) % 2 === 1) board[r][c] = { color: 'r', king: false }
  return board
}

function getMoves(board, r, c) {
  const piece = board[r][c]
  if (!piece) return []
  const dirs = piece.color === 'r' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]
  const allDirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : dirs
  const moves = [], jumps = []
  for (const [dr, dc] of allDirs) {
    const nr = r + dr, nc = c + dc
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      if (!board[nr][nc]) moves.push({ r: nr, c: nc, jump: false })
      else if (board[nr][nc].color !== piece.color) {
        const jr = r + dr*2, jc = c + dc*2
        if (jr >= 0 && jr < SIZE && jc >= 0 && jc < SIZE && !board[jr][jc])
          jumps.push({ r: jr, c: jc, jump: true, captureR: nr, captureC: nc })
      }
    }
  }
  return jumps.length > 0 ? jumps : moves
}

export default function Checkers() {
  const [board, setBoard] = useState(initBoard())
  const [selected, setSelected] = useState(null)
  const [turn, setTurn] = useState('r')
  const [scores, setScores] = useState({ r: 12, b: 12 })
  const [winner, setWinner] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [vsAI, setVsAI] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleClick = useCallback((r, c) => {
    if (winner) return
    const piece = board[r][c]

    if (selected) {
      const move = highlights.find(h => h.r === r && h.c === c)
      if (move) {
        const nb = board.map(row => row.map(cell => cell ? {...cell} : null))
        nb[r][c] = { ...nb[selected.r][selected.c] }
        nb[selected.r][selected.c] = null
        let newScores = { ...scores }
        if (move.jump) {
          nb[move.captureR][move.captureC] = null
          newScores[turn === 'r' ? 'b' : 'r']--
        }
        // King promotion
        if (r === 0 && nb[r][c].color === 'r') nb[r][c].king = true
        if (r === SIZE - 1 && nb[r][c].color === 'b') nb[r][c].king = true

        setBoard(nb); setScores(newScores); setSelected(null); setHighlights([])
        const nextTurn = turn === 'r' ? 'b' : 'r'
        if (newScores[turn === 'r' ? 'b' : 'r'] === 0) {
          setWinner(turn); setShowConfetti(true); return
        }
        setTurn(nextTurn)

        // AI
        if (vsAI && nextTurn === 'b') {
          setTimeout(() => {
            const pieces = []
            nb.forEach((row, ar) => row.forEach((cell, ac) => { if (cell?.color === 'b') pieces.push([ar, ac]) }))
            if (!pieces.length) return
            for (const [pr, pc] of pieces) {
              const moves = getMoves(nb, pr, pc)
              const jumpM = moves.find(m => m.jump)
              if (jumpM) {
                const ab = nb.map(row => row.map(c => c ? {...c} : null))
                ab[jumpM.r][jumpM.c] = { ...ab[pr][pc] }
                ab[pr][pc] = null; ab[jumpM.captureR][jumpM.captureC] = null
                const ns2 = { ...newScores, r: newScores.r - 1 }
                if (jumpM.r === SIZE-1) ab[jumpM.r][jumpM.c].king = true
                setBoard(ab); setScores(ns2)
                if (ns2.r === 0) { setWinner('b'); setShowConfetti(true) }
                else setTurn('r')
                return
              }
            }
            const [pr, pc] = pieces[Math.floor(Math.random() * pieces.length)]
            const moves = getMoves(nb, pr, pc)
            if (moves.length) {
              const m = moves[Math.floor(Math.random() * moves.length)]
              const ab = nb.map(row => row.map(c => c ? {...c} : null))
              ab[m.r][m.c] = { ...ab[pr][pc] }
              ab[pr][pc] = null
              if (m.r === SIZE-1) ab[m.r][m.c].king = true
              setBoard(ab); setTurn('r')
            }
          }, 600)
        }
        return
      }
      if (piece?.color === turn) {
        setSelected({ r, c }); setHighlights(getMoves(board, r, c)); return
      }
      setSelected(null); setHighlights([]); return
    }

    if (piece?.color === turn) {
      setSelected({ r, c })
      setHighlights(getMoves(board, r, c))
    }
  }, [board, selected, highlights, turn, winner, vsAI, scores])

  const reset = () => { setBoard(initBoard()); setSelected(null); setHighlights([]); setTurn('r'); setWinner(null); setScores({ r: 12, b: 12 }); setShowConfetti(false) }

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {showConfetti && <Confetti recycle={false} />}
      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">CHECKERS</h2>
        <button onClick={() => setVsAI(!vsAI)}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2P'}
        </button>
      </div>

      <div className="flex gap-4">
        {[['r', vsAI ? 'You (Red)' : 'Red', '#FF4444'], ['b', vsAI ? 'AI (Black)' : 'Black', '#555']].map(([c, label, col]) => (
          <div key={c} className="card-glass rounded-xl px-5 py-2 text-center border-2" style={{ borderColor: turn === c && !winner ? col : 'transparent' }}>
            <div className="font-cyber text-xl font-bold" style={{ color: col }}>{scores[c]}</div>
            <div className="text-xs text-white/40 font-body">{label}</div>
          </div>
        ))}
      </div>

      {winner && (
        <div className="font-cyber text-lg" style={{ color: winner === 'r' ? '#FF4444' : '#888' }}>
          {winner === 'r' ? (vsAI ? '🎉 You Win!' : 'Red Wins!') : (vsAI ? '🤖 AI Wins!' : 'Black Wins!')}
        </div>
      )}

      <div className="border-2 border-white/20 rounded-xl overflow-hidden">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1
              const isSel = selected?.r === r && selected?.c === c
              const isHL = highlights.some(h => h.r === r && h.c === c)
              return (
                <div key={c} onClick={() => isDark && handleClick(r, c)}
                  className={`w-11 h-11 flex items-center justify-center transition-all relative
                  ${isDark ? 'cursor-pointer' : ''}`}
                  style={{ background: isSel ? 'rgba(0,245,255,0.3)' : isHL ? 'rgba(0,245,255,0.15)' : isDark ? '#2a1a0a' : '#f0d9b5' }}>
                  {isHL && <div className="absolute inset-2 rounded-full border-2 border-neon-cyan/60 opacity-70" />}
                  {cell && (
                    <motion.div whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-cyber text-sm font-bold shadow-lg"
                      style={{ background: cell.color === 'r' ? '#FF4444' : '#333', borderColor: cell.color === 'r' ? '#FF8888' : '#888', boxShadow: isSel ? `0 0 12px ${cell.color === 'r' ? '#FF4444' : '#888'}` : 'none' }}>
                      {cell.king ? '♛' : ''}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
