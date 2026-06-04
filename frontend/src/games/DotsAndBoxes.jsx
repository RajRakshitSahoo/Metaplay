import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const SIZE = 4

function createEmpty() { return Array(SIZE + 1).fill(null).map(() => Array(SIZE).fill(0)) }
function createEmptyV() { return Array(SIZE).fill(null).map(() => Array(SIZE + 1).fill(0)) }
function createEmptyBoxes() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)) }

export default function DotsAndBoxes() {
  const [hLines, setHLines] = useState(createEmpty)
  const [vLines, setVLines] = useState(createEmptyV)
  const [boxes, setBoxes] = useState(createEmptyBoxes)
  const [turn, setTurn] = useState(1)
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [vsAI, setVsAI] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)

  const checkAndUpdateBoxes = useCallback((nh, nv, currentBoxes, currentScores, player) => {
    const nb = currentBoxes.map(r => [...r])
    let scored = 0
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!nb[r][c] && nh[r][c] && nh[r + 1][c] && nv[r][c] && nv[r][c + 1]) {
          nb[r][c] = player
          scored++
        }
      }
    }
    const newScores = { ...currentScores }
    if (scored > 0) newScores[player] = (newScores[player] || 0) + scored
    return { nb, newScores, scored }
  }, [])

  const totalLines = SIZE * (SIZE + 1) * 2
  const filledLines = (h, v) => h.flat().filter(Boolean).length + v.flat().filter(Boolean).length

  const doAIMove = useCallback((nh, nv, nb, currentScores, currentTurn) => {
    setAiThinking(true)
    setTimeout(() => {
      // Strategy: complete boxes first, then avoid giving boxes
      let bestMove = null

      // 1. Find completing moves (3 sides filled)
      for (let r = 0; r <= SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (!nh[r][c]) {
            const testH = nh.map(row => [...row]); testH[r][c] = 2
            const { scored } = checkAndUpdateBoxes(testH, nv, nb, currentScores, 2)
            if (scored > 0) { bestMove = { type: 'h', r, c }; break }
          }
        }
        if (bestMove) break
      }

      if (!bestMove) {
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c <= SIZE; c++) {
            if (!nv[r][c]) {
              const testV = nv.map(row => [...row]); testV[r][c] = 2
              const { scored } = checkAndUpdateBoxes(nh, testV, nb, currentScores, 2)
              if (scored > 0) { bestMove = { type: 'v', r, c }; break }
            }
          }
          if (bestMove) break
        }
      }

      // 2. Find safe move (won't complete a box for opponent)
      if (!bestMove) {
        const safeMoves = []
        for (let r = 0; r <= SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            if (!nh[r][c]) {
              const testH = nh.map(row => [...row]); testH[r][c] = 2
              // Check if this gives opponent a box
              let givesBox = false
              for (let br = 0; br < SIZE; br++) {
                for (let bc = 0; bc < SIZE; bc++) {
                  if (!nb[br][bc]) {
                    const sides = [testH[br][bc], testH[br+1][bc], nv[br][bc], nv[br][bc+1]].filter(Boolean).length
                    if (sides === 3) givesBox = true
                  }
                }
              }
              if (!givesBox) safeMoves.push({ type: 'h', r, c })
            }
          }
        }
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c <= SIZE; c++) {
            if (!nv[r][c]) {
              const testV = nv.map(row => [...row]); testV[r][c] = 2
              let givesBox = false
              for (let br = 0; br < SIZE; br++) {
                for (let bc = 0; bc < SIZE; bc++) {
                  if (!nb[br][bc]) {
                    const sides = [nh[br][bc], nh[br+1][bc], testV[br][bc], testV[br][bc+1]].filter(Boolean).length
                    if (sides === 3) givesBox = true
                  }
                }
              }
              if (!givesBox) safeMoves.push({ type: 'v', r, c })
            }
          }
        }
        if (safeMoves.length > 0) bestMove = safeMoves[Math.floor(Math.random() * safeMoves.length)]
      }

      // 3. Random move
      if (!bestMove) {
        const all = []
        for (let r = 0; r <= SIZE; r++) for (let c = 0; c < SIZE; c++) if (!nh[r][c]) all.push({ type: 'h', r, c })
        for (let r = 0; r < SIZE; r++) for (let c = 0; c <= SIZE; c++) if (!nv[r][c]) all.push({ type: 'v', r, c })
        if (all.length) bestMove = all[Math.floor(Math.random() * all.length)]
      }

      if (!bestMove) { setAiThinking(false); return }

      let newH = nh, newV = nv
      if (bestMove.type === 'h') { newH = nh.map(row => [...row]); newH[bestMove.r][bestMove.c] = 2 }
      else { newV = nv.map(row => [...row]); newV[bestMove.r][bestMove.c] = 2 }

      setHLines(newH); setVLines(newV)
      const { nb: newBoxes, newScores: ns2, scored } = checkAndUpdateBoxes(newH, newV, nb, currentScores, 2)
      setBoxes(newBoxes); setScores(ns2)

      const totalFilled = filledLines(newH, newV)
      const totalPossible = SIZE * (SIZE + 1) * 2
      if (totalFilled >= totalPossible) { setGameOver(true); setAiThinking(false); return }

      if (scored > 0) {
        // AI gets another turn
        setAiThinking(false)
        setTimeout(() => doAIMove(newH, newV, newBoxes, ns2, 2), 400)
      } else {
        setTurn(1)
        setAiThinking(false)
      }
    }, 300)
  }, [checkAndUpdateBoxes, filledLines])

  const clickH = useCallback((r, c) => {
    if (hLines[r][c] || gameOver || aiThinking || (vsAI && turn === 2)) return
    const nh = hLines.map(row => [...row]); nh[r][c] = turn
    setHLines(nh)
    const { nb, newScores, scored } = checkAndUpdateBoxes(nh, vLines, boxes, scores, turn)
    setBoxes(nb); setScores(newScores)
    const totalFilled = filledLines(nh, vLines)
    const totalPossible = SIZE * (SIZE + 1) * 2
    if (totalFilled >= totalPossible) { setGameOver(true); return }
    if (scored > 0) return // same player goes again
    const next = turn === 1 ? 2 : 1
    setTurn(next)
    if (vsAI && next === 2) doAIMove(nh, vLines, nb, newScores, 2)
  }, [hLines, vLines, boxes, scores, turn, gameOver, aiThinking, vsAI, checkAndUpdateBoxes, doAIMove, filledLines])

  const clickV = useCallback((r, c) => {
    if (vLines[r][c] || gameOver || aiThinking || (vsAI && turn === 2)) return
    const nv = vLines.map(row => [...row]); nv[r][c] = turn
    setVLines(nv)
    const { nb, newScores, scored } = checkAndUpdateBoxes(hLines, nv, boxes, scores, turn)
    setBoxes(nb); setScores(newScores)
    const totalFilled = filledLines(hLines, nv)
    const totalPossible = SIZE * (SIZE + 1) * 2
    if (totalFilled >= totalPossible) { setGameOver(true); return }
    if (scored > 0) return
    const next = turn === 1 ? 2 : 1
    setTurn(next)
    if (vsAI && next === 2) doAIMove(hLines, nv, nb, newScores, 2)
  }, [hLines, vLines, boxes, scores, turn, gameOver, aiThinking, vsAI, checkAndUpdateBoxes, doAIMove, filledLines])

  const reset = () => {
    setHLines(createEmpty()); setVLines(createEmptyV()); setBoxes(createEmptyBoxes())
    setTurn(1); setScores({ 1: 0, 2: 0 }); setGameOver(false); setAiThinking(false)
  }

  const CELL = 60, DOT = 10, LINE_LEN = CELL - DOT

  const winner = gameOver ? (scores[1] > scores[2] ? 'You' : scores[2] > scores[1] ? (vsAI ? 'AI' : 'Player 2') : 'Draw') : null

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">DOTS & BOXES</h2>
        <button onClick={() => { setVsAI(!vsAI); reset() }}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2P'}
        </button>
      </div>

      <div className="flex gap-4">
        {[[1,'You','#00F5FF'],[2,vsAI?'AI':'P2','#FF00FF']].map(([p,label,col]) => (
          <div key={p} className="card-glass rounded-xl px-5 py-2 text-center border-2 transition-all"
            style={{ borderColor: turn === p && !gameOver ? col : 'transparent' }}>
            <div className="font-cyber text-xl font-bold" style={{ color: col }}>{scores[p]}</div>
            <div className="text-xs text-white/40 font-body">{label}</div>
          </div>
        ))}
      </div>

      <div className="font-cyber text-sm text-center min-h-5">
        {gameOver
          ? <span style={{ color: winner === 'You' ? '#00F5FF' : winner === 'Draw' ? '#F59E0B' : '#FF00FF' }}>
              {winner === 'Draw' ? '🤝 Draw!' : `🏆 ${winner} Win${winner === 'You' ? '' : 's'}!`}
            </span>
          : <span className="text-white/50">
              {aiThinking ? <span className="text-neon-purple animate-pulse">AI thinking...</span>
                : turn === 1 ? <span style={{color:'#00F5FF'}}>Your turn</span>
                : <span style={{color:'#FF00FF'}}>P2's turn</span>}
            </span>
        }
      </div>

      {/* Board */}
      <div className="relative select-none"
        style={{ width: (SIZE + 1) * CELL, height: (SIZE + 1) * CELL }}>

        {/* Boxes (filled backgrounds) */}
        {boxes.map((row, r) => row.map((box, c) => box ? (
          <div key={`box-${r}-${c}`} className="absolute rounded-sm transition-all"
            style={{
              left: DOT/2 + c * CELL + 2, top: DOT/2 + r * CELL + 2,
              width: LINE_LEN - 4, height: LINE_LEN - 4,
              background: box === 1 ? 'rgba(0,245,255,0.2)' : 'rgba(255,0,255,0.2)',
            }} />
        ) : null))}

        {/* Horizontal lines */}
        {hLines.map((row, r) => row.map((v, c) => (
          <div key={`h-${r}-${c}`}
            onClick={() => clickH(r, c)}
            className="absolute rounded-full transition-all duration-150 group"
            style={{
              left: DOT/2 + c * CELL, top: r * CELL + 1,
              width: LINE_LEN, height: DOT - 2,
              background: v === 1 ? '#00F5FF' : v === 2 ? '#FF00FF' : 'rgba(255,255,255,0.1)',
              cursor: !v && !gameOver && !(vsAI && turn === 2) ? 'pointer' : 'default',
              boxShadow: v === 1 ? '0 0 8px #00F5FF' : v === 2 ? '0 0 8px #FF00FF' : 'none',
            }}
            onMouseEnter={e => { if (!v && !gameOver && !(vsAI && turn===2)) e.currentTarget.style.background = turn===1?'rgba(0,245,255,0.5)':'rgba(255,0,255,0.5)' }}
            onMouseLeave={e => { if (!v) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          />
        )))}

        {/* Vertical lines */}
        {vLines.map((row, r) => row.map((v, c) => (
          <div key={`v-${r}-${c}`}
            onClick={() => clickV(r, c)}
            className="absolute rounded-full transition-all duration-150"
            style={{
              left: c * CELL + 1, top: DOT/2 + r * CELL,
              width: DOT - 2, height: LINE_LEN,
              background: v === 1 ? '#00F5FF' : v === 2 ? '#FF00FF' : 'rgba(255,255,255,0.1)',
              cursor: !v && !gameOver && !(vsAI && turn === 2) ? 'pointer' : 'default',
              boxShadow: v === 1 ? '0 0 8px #00F5FF' : v === 2 ? '0 0 8px #FF00FF' : 'none',
            }}
            onMouseEnter={e => { if (!v && !gameOver && !(vsAI && turn===2)) e.currentTarget.style.background = turn===1?'rgba(0,245,255,0.5)':'rgba(255,0,255,0.5)' }}
            onMouseLeave={e => { if (!v) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          />
        )))}

        {/* Dots */}
        {Array(SIZE + 1).fill(null).map((_, r) => Array(SIZE + 1).fill(null).map((_, c) => (
          <div key={`dot-${r}-${c}`} className="absolute rounded-full bg-white shadow-lg"
            style={{ left: c * CELL - DOT/2 + 1, top: r * CELL - DOT/2 + 1, width: DOT + 2, height: DOT + 2,
              boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
        )))}

        {/* Box score labels */}
        {boxes.map((row, r) => row.map((box, c) => box ? (
          <div key={`lbl-${r}-${c}`} className="absolute flex items-center justify-center font-cyber text-xs font-bold pointer-events-none"
            style={{ left: DOT/2 + c*CELL, top: DOT/2 + r*CELL, width: LINE_LEN, height: LINE_LEN,
              color: box === 1 ? '#00F5FF' : '#FF00FF' }}>
            {box === 1 ? 'You' : vsAI ? 'AI' : 'P2'}
          </div>
        ) : null))}
      </div>

      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
