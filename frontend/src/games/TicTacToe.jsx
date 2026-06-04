import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import sound from '../utils/gameSound'
import api from '../utils/api'

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line: [a, b, c] }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] }
  return null
}

function minimax(board, isMax, depth = 0) {
  const result = checkWinner(board)
  if (result) {
    if (result.winner === 'O') return 10 - depth
    if (result.winner === 'X') return depth - 10
    return 0
  }
  const scores = []
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? 'O' : 'X'
      scores.push(minimax(board, !isMax, depth + 1))
      board[i] = null
    }
  }
  return isMax ? Math.max(...scores) : Math.min(...scores)
}

function getBestMove(board) {
  let best = -Infinity, move = -1
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O'
      const score = minimax(board, false)
      board[i] = null
      if (score > best) { best = score; move = i }
    }
  }
  return move
}

export default function TicTacToe({ onGameEnd }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isX, setIsX] = useState(true)
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 })
  const [vsAI, setVsAI] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedResult, setSavedResult] = useState(null)

  const result = checkWinner(board)

  const saveResult = useCallback(async (res) => {
    if (savedResult) return
    setSavedResult(res)
    try {
      await api.post('/matchhistory/save', {
        game: 'tictactoe',
        result: res,
        opponent: vsAI ? 'AI' : 'Player 2',
        duration: 0,
      })
    } catch {}
    if (onGameEnd) onGameEnd(res)
  }, [savedResult, vsAI, onGameEnd])

  const handleClick = useCallback((i) => {
    if (board[i] || result) return
    if (vsAI && !isX) return
    sound.move()
    const newBoard = [...board]
    newBoard[i] = isX ? 'X' : 'O'
    setBoard(newBoard)
    setIsX(!isX)
    const res = checkWinner(newBoard)
    if (res) {
      if (res.winner !== 'draw') {
        sound.win()
        setScores(s => ({ ...s, [res.winner]: s[res.winner] + 1 }))
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        saveResult(res.winner === 'X' ? 'win' : 'loss')
      } else {
        sound.draw()
        setScores(s => ({ ...s, draw: s.draw + 1 }))
        saveResult('draw')
      }
      return
    }
    if (vsAI) {
      setTimeout(() => {
        const aiBoard = [...newBoard]
        const aiMove = getBestMove([...aiBoard])
        if (aiMove !== -1) {
          sound.move()
          aiBoard[aiMove] = 'O'
          setBoard(aiBoard)
          setIsX(true)
          const aiRes = checkWinner(aiBoard)
          if (aiRes) {
            if (aiRes.winner !== 'draw') {
              sound.lose()
              setScores(s => ({ ...s, [aiRes.winner]: s[aiRes.winner] + 1 }))
              saveResult(aiRes.winner === 'X' ? 'win' : 'loss')
            } else {
              sound.draw()
              setScores(s => ({ ...s, draw: s.draw + 1 }))
              saveResult('draw')
            }
          }
        }
      }, 400)
    }
  }, [board, isX, result, vsAI, saveResult])

  const reset = () => {
    setBoard(Array(9).fill(null))
    setIsX(true)
    setSavedResult(null)
    sound.button()
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">TIC-TAC-TOE</h2>
        <button onClick={() => { setVsAI(!vsAI); reset() }}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all
          ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2P'}
        </button>
      </div>

      <div className="flex gap-6">
        {[['X','You','#00F5FF'],['O',vsAI?'AI':'P2','#FF00FF']].map(([sym,label,color]) => (
          <div key={sym} className="text-center card-glass rounded-xl px-6 py-3">
            <div className="font-cyber text-2xl font-bold" style={{ color }}>{scores[sym]}</div>
            <div className="text-xs text-white/40 font-body">{label} ({sym})</div>
          </div>
        ))}
        <div className="text-center card-glass rounded-xl px-6 py-3">
          <div className="font-cyber text-2xl font-bold text-white/40">{scores.draw}</div>
          <div className="text-xs text-white/40 font-body">Draw</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={result?.winner || (isX ? 'x' : 'o')}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="font-cyber text-sm min-h-5">
          {result ? (
            result.winner === 'draw'
              ? <span className="text-yellow-400">It's a Draw! 🤝</span>
              : <span style={{ color: result.winner === 'X' ? '#00F5FF' : '#FF00FF' }}>
                  {result.winner === 'X' ? (vsAI ? '🎉 You Win!' : 'Player X Wins!') : (vsAI ? '🤖 AI Wins!' : 'Player O Wins!')}
                </span>
          ) : (
            <span className="text-white/60">
              {isX
                ? <span style={{ color: '#00F5FF' }}>⭕ Player X's Turn</span>
                : vsAI
                  ? <span style={{ color: '#FF00FF' }}>🤖 AI is thinking...</span>
                  : <span style={{ color: '#FF00FF' }}>✕ Player O's Turn</span>
              }
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => {
          const isWinCell = result?.line?.includes(i)
          return (
            <motion.button key={i}
              whileHover={!cell && !result ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(i)}
              className={`w-24 h-24 rounded-xl text-4xl font-cyber font-bold flex items-center justify-center border-2 transition-all duration-200
              ${isWinCell ? 'border-yellow-400 bg-yellow-400/10'
              : cell ? 'border-white/10 bg-white/5'
              : 'border-white/10 bg-bg-card hover:border-neon-cyan/40 hover:bg-neon-cyan/5 cursor-pointer'}`}>
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: cell ? 1 : 0, rotate: cell ? 0 : -90 }}
                style={{ color: cell === 'X' ? '#00F5FF' : '#FF00FF' }}>
                {cell}
              </motion.span>
            </motion.button>
          )
        })}
      </div>

      {result && (
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          onClick={reset} className="btn-neon text-sm py-3 px-8 mt-2">
          🔄 Play Again
        </motion.button>
      )}
    </div>
  )
}
