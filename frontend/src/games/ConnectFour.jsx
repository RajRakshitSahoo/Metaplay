import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

const ROWS = 6, COLS = 7

function createBoard() { return Array(ROWS).fill(null).map(() => Array(COLS).fill(null)) }

function checkWin(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (const sign of [1, -1]) {
      let r = row + dr*sign, c = col + dc*sign
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++; r += dr*sign; c += dc*sign
      }
    }
    if (count >= 4) return true
  }
  return false
}

function getAIMove(board) {
  // Simple AI: block or win
  for (let col = 0; col < COLS; col++) {
    for (const p of ['O', 'X']) {
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
          board[row][col] = p
          if (checkWin(board, row, col, p)) { board[row][col] = null; if (p === 'O') return col }
          board[row][col] = null
          break
        }
      }
    }
  }
  // Center preference
  const pref = [3,2,4,1,5,0,6]
  for (const col of pref) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) return col
    }
  }
  return 0
}

export default function ConnectFour() {
  const [board, setBoard] = useState(createBoard())
  const [current, setCurrent] = useState('X')
  const [winner, setWinner] = useState(null)
  const [scores, setScores] = useState({ X: 0, O: 0 })
  const [vsAI, setVsAI] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hoverCol, setHoverCol] = useState(null)

  const dropPiece = useCallback((col) => {
    if (winner || (vsAI && current === 'O')) return
    const newBoard = board.map(r => [...r])
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = current
        setBoard(newBoard)
        if (checkWin(newBoard, row, col, current)) {
          setWinner(current)
          setScores(s => ({ ...s, [current]: s[current] + 1 }))
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        } else if (newBoard[0].every(c => c)) {
          setWinner('draw')
        } else {
          const next = current === 'X' ? 'O' : 'X'
          setCurrent(next)
          if (vsAI && next === 'O') {
            setTimeout(() => {
              const aiBoard = newBoard.map(r => [...r])
              const aiCol = getAIMove(aiBoard)
              for (let r = ROWS - 1; r >= 0; r--) {
                if (!aiBoard[r][aiCol]) {
                  aiBoard[r][aiCol] = 'O'
                  setBoard(aiBoard)
                  if (checkWin(aiBoard, r, aiCol, 'O')) {
                    setWinner('O')
                    setScores(s => ({ ...s, O: s.O + 1 }))
                  } else if (aiBoard[0].every(c => c)) {
                    setWinner('draw')
                  }
                  setCurrent('X')
                  break
                }
              }
            }, 500)
          }
        }
        return
      }
    }
  }, [board, current, winner, vsAI])

  const reset = () => { setBoard(createBoard()); setCurrent('X'); setWinner(null) }

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">CONNECT FOUR</h2>
        <button onClick={() => setVsAI(!vsAI)}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2P'}
        </button>
      </div>

      {/* Score */}
      <div className="flex gap-4">
        {[['X', 'You', '#FF4444'], ['O', vsAI ? 'AI' : 'P2', '#FFDD00']].map(([s, label, color]) => (
          <div key={s} className="card-glass rounded-xl px-5 py-2 text-center">
            <div className="font-cyber text-xl font-bold" style={{ color }}>{scores[s]}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      <div className="font-cyber text-sm">
        {winner ? (
          winner === 'draw' ? <span className="text-yellow-400">Draw! 🤝</span>
            : <span style={{ color: winner === 'X' ? '#FF4444' : '#FFDD00' }}>
                {winner === 'X' ? (vsAI ? 'You Win! 🎉' : 'Red Wins!') : (vsAI ? 'AI Wins! 🤖' : 'Yellow Wins!')} 
              </span>
        ) : (
          <span className="text-white/60">
            {current === 'X' ? <span style={{ color: '#FF4444' }}>🔴 {vsAI ? 'Your' : 'Red'} Turn</span>
              : vsAI ? <span style={{ color: '#FFDD00' }}>🤖 AI thinking...</span>
              : <span style={{ color: '#FFDD00' }}>🟡 Yellow's Turn</span>}
          </span>
        )}
      </div>

      {/* Board */}
      <div className="bg-neon-purple/20 border-2 border-neon-purple/40 rounded-2xl p-3 glow-purple">
        {/* Column buttons */}
        <div className="grid mb-1" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '6px' }}>
          {Array(COLS).fill(null).map((_, col) => (
            <button key={col} onClick={() => dropPiece(col)} onMouseEnter={() => setHoverCol(col)} onMouseLeave={() => setHoverCol(null)}
              className="h-6 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors text-lg">
              {hoverCol === col && !winner ? '▼' : ''}
            </button>
          ))}
        </div>
        {board.map((row, r) => (
          <div key={r} className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '6px', marginBottom: '6px' }}>
            {row.map((cell, c) => (
              <motion.div key={c} initial={false}
                className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center cursor-pointer hover:opacity-90"
                style={{
                  background: cell === 'X' ? '#FF4444' : cell === 'O' ? '#FFDD00' : '#ffffff08',
                  boxShadow: cell ? `0 0 10px ${cell === 'X' ? '#FF4444' : '#FFDD00'}80` : 'none',
                }}
                onClick={() => dropPiece(c)}
              >
                {!cell && hoverCol === c && (
                  <div className="w-6 h-6 rounded-full opacity-30"
                    style={{ background: current === 'X' ? '#FF4444' : '#FFDD00' }} />
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {winner && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={reset} className="btn-neon text-sm py-3 px-8">🔄 Play Again</motion.button>
      )}
    </div>
  )
}
