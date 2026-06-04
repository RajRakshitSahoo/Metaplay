import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'

// Full Ludo board implementation
const COLORS = ['red', 'blue', 'green', 'yellow']
const COLOR_HEX = { red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308' }
const COLOR_BG = { red: '#FEE2E2', blue: '#DBEAFE', green: '#DCFCE7', yellow: '#FEF9C3' }

// Each color has 4 tokens. Track positions: -1=home base, 0-51=board, 52-57=home column, 58=finished
const HOME_ENTRANCE = { red: 51, blue: 12, green: 25, yellow: 38 }
const START_POS = { red: 1, blue: 14, green: 27, yellow: 40 }
const SAFE = new Set([1, 9, 14, 22, 27, 35, 40, 48, 9, 22, 35, 48])

// Board cell positions on 15x15 grid
const BOARD_CELLS = (() => {
  // Main track: 52 cells going around the board
  const cells = {}
  // Bottom row going right (red start area)
  const track = [
    [6,1],[6,2],[6,3],[6,4],[6,5],
    [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
    [0,7],
    [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
    [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
    [7,14],
    [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
    [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
    [14,7],
    [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
    [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
    [7,0],
    [6,0]
  ]
  track.forEach((pos, i) => { cells[i] = pos })
  return cells
})()

// Home column cells for each color
const HOME_COL = {
  red:    [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  blue:   [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
}

// Home base positions for each color (where unstarted tokens sit)
const HOME_BASE = {
  red:    [[1,1],[1,3],[3,1],[3,3]],
  blue:   [[1,11],[1,13],[3,11],[3,13]],
  green:  [[11,11],[11,13],[13,11],[13,13]],
  yellow: [[11,1],[11,3],[13,1],[13,3]],
}

function initTokens() {
  return {
    red:    [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
    blue:   [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
    green:  [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
    yellow: [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }],
  }
}

function rollDice() { return Math.floor(Math.random() * 6) + 1 }

function getTokenBoardPos(color, token) {
  if (token.pos === -1) return null // in home base
  if (token.pos >= 100) return null // finished
  if (token.pos >= 52) {
    // In home column
    const idx = token.pos - 52
    return HOME_COL[color][idx] || null
  }
  // On main track - need to calculate relative position
  const start = START_POS[color]
  const absPos = (start + token.pos - 1) % 52
  return BOARD_CELLS[absPos] || null
}

function canMove(color, token, dice) {
  if (token.pos === -1) return dice === 6
  if (token.pos >= 100) return false
  if (token.pos >= 52) {
    // In home column
    const newIdx = (token.pos - 52) + dice
    return newIdx <= 5 // max 6 steps in home col
  }
  // Check if approaching home entrance
  const stepsToEntrance = HOME_ENTRANCE[color] === START_POS[color] - 1 ? 51 : 
    ((HOME_ENTRANCE[color] - START_POS[color] + 1 + 52) % 52) + 1
  if (token.pos + dice === stepsToEntrance + 1) return true // enters home col
  if (token.pos + dice > stepsToEntrance + 6) return false  // overshoots
  return true
}

function moveToken(color, tokenIdx, tokens, dice) {
  const newTokens = JSON.parse(JSON.stringify(tokens))
  const token = newTokens[color][tokenIdx]
  
  if (token.pos === -1) {
    // Enter board
    token.pos = 0
    return newTokens
  }
  
  const entrance = ((HOME_ENTRANCE[color] - START_POS[color] + 1 + 52) % 52) + 1
  
  if (token.pos + dice >= entrance && token.pos < entrance) {
    // Enter home column
    const extra = (token.pos + dice) - entrance
    token.pos = 52 + extra
  } else if (token.pos >= 52) {
    const newIdx = (token.pos - 52) + dice
    if (newIdx >= 6) token.pos = 100 // finished
    else token.pos = 52 + newIdx
  } else {
    token.pos += dice
    if (token.pos >= 52) token.pos = token.pos % 52
  }
  return newTokens
}

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const PLAYERS_2 = ['red', 'blue']

export default function Ludo() {
  const [tokens, setTokens] = useState(initTokens)
  const [turn, setTurn] = useState('red')
  const [dice, setDice] = useState(null)
  const [rolled, setRolled] = useState(false)
  const [movable, setMovable] = useState([])
  const [winner, setWinner] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [msg, setMsg] = useState("Red's turn — Roll the dice!")
  const [vsAI, setVsAI] = useState(true)
  const [rolling, setRolling] = useState(false)
  const [animDice, setAnimDice] = useState(1)

  const players = PLAYERS_2

  const checkWinner = useCallback((toks) => {
    for (const color of players) {
      if (toks[color].every(t => t.pos >= 100)) return color
    }
    return null
  }, [players])

  const getMovable = useCallback((color, diceVal, toks) => {
    return toks[color].map((t, i) => canMove(color, t, diceVal) ? i : -1).filter(i => i !== -1)
  }, [])

  const doRoll = useCallback((forColor = turn, currentTokens = tokens) => {
    if (rolled || winner) return
    setRolling(true)
    let count = 0
    const anim = setInterval(() => {
      setAnimDice(Math.floor(Math.random() * 6) + 1)
      count++
      if (count > 8) {
        clearInterval(anim)
        setRolling(false)
        const val = rollDice()
        setDice(val)
        setAnimDice(val)
        setRolled(true)
        const mv = getMovable(forColor, val, currentTokens)
        if (mv.length === 0) {
          setMsg(`${forColor.toUpperCase()}: No moves! Switching...`)
          setTimeout(() => {
            setRolled(false)
            setDice(null)
            const next = players[(players.indexOf(forColor) + 1) % players.length]
            setTurn(next)
            setMsg(`${next.toUpperCase()}'s turn — Roll!`)
            if (vsAI && next !== 'red') {
              setTimeout(() => doAITurn(next, currentTokens), 600)
            }
          }, 1000)
        } else if (mv.length === 1 && (currentTokens[forColor][mv[0]].pos === -1 && val === 6)) {
          setMovable(mv)
          setMsg(`${forColor.toUpperCase()}: Click a token to move`)
        } else {
          setMovable(mv)
          setMsg(`${forColor.toUpperCase()}: Choose a token to move`)
        }
      }
    }, 80)
  }, [rolled, winner, turn, tokens, getMovable, players, vsAI])

  const doAITurn = useCallback((color, currentTokens) => {
    const val = rollDice()
    setDice(val)
    setAnimDice(val)
    setRolled(true)
    const mv = getMovable(color, val, currentTokens)
    if (mv.length === 0) {
      setMsg(`${color.toUpperCase()}: No moves!`)
      setTimeout(() => {
        setRolled(false); setDice(null)
        setTurn('red'); setMsg("Red's turn — Roll!")
      }, 900)
      return
    }
    // AI picks: prefer token closest to finish
    const pick = mv.reduce((best, i) => currentTokens[color][i].pos > currentTokens[color][best].pos ? i : best, mv[0])
    setTimeout(() => {
      const newToks = moveToken(color, pick, currentTokens, val)
      setTokens(newToks)
      setRolled(false); setDice(null); setMovable([])
      const w = checkWinner(newToks)
      if (w) { setWinner(w); setShowConfetti(true); setMsg(`${w.toUpperCase()} WINS! 🏆`); return }
      const extraTurn = val === 6
      if (extraTurn) {
        setMsg(`${color.toUpperCase()}: Rolled 6! Again!`)
        setTimeout(() => doAITurn(color, newToks), 700)
      } else {
        setTurn('red'); setMsg("Red's turn — Roll!")
      }
    }, 700)
  }, [getMovable, checkWinner])

  const handleTokenClick = useCallback((color, idx) => {
    if (color !== turn || !rolled || !movable.includes(idx) || winner) return
    const newToks = moveToken(color, idx, tokens, dice)
    setTokens(newToks)
    setMovable([]); setRolled(false); setDice(null)
    const w = checkWinner(newToks)
    if (w) { setWinner(w); setShowConfetti(true); setMsg(`${w.toUpperCase()} WINS! 🏆`); return }
    const extraTurn = dice === 6
    if (extraTurn) {
      setMsg(`${turn.toUpperCase()}: Rolled 6! Roll again!`)
    } else {
      const next = players[(players.indexOf(turn) + 1) % players.length]
      setTurn(next)
      setMsg(`${next.toUpperCase()}'s turn — Roll!`)
      if (vsAI && next !== 'red') {
        setTimeout(() => doAITurn(next, newToks), 600)
      }
    }
  }, [turn, rolled, movable, winner, tokens, dice, checkWinner, players, vsAI, doAITurn])

  const reset = () => {
    setTokens(initTokens()); setTurn('red'); setDice(null)
    setRolled(false); setMovable([]); setWinner(null)
    setShowConfetti(false); setMsg("Red's turn — Roll!")
  }

  // Render the board
  const CELL = 38 // cell size in px
  const BOARD = 15 * CELL

  const renderBoard = () => {
    // Build a map of which tokens are on which board cell
    const cellTokens = {}
    players.forEach(color => {
      tokens[color].forEach((token, ti) => {
        const pos = getTokenBoardPos(color, token)
        if (pos) {
          const key = `${pos[0]},${pos[1]}`
          if (!cellTokens[key]) cellTokens[key] = []
          cellTokens[key].push({ color, ti, token })
        }
      })
    })

    return (
      <div className="relative border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl"
        style={{ width: BOARD, height: BOARD, minWidth: BOARD, background: '#1a1a2e' }}>
        {/* Color quadrants */}
        {/* Red - top left */}
        <div className="absolute border border-red-400/30" style={{ left: 0, top: 0, width: CELL * 6, height: CELL * 6, background: '#EF444420' }} />
        {/* Blue - top right */}
        <div className="absolute border border-blue-400/30" style={{ left: CELL * 9, top: 0, width: CELL * 6, height: CELL * 6, background: '#3B82F620' }} />
        {/* Green - bottom right */}
        <div className="absolute border border-green-400/30" style={{ left: CELL * 9, top: CELL * 9, width: CELL * 6, height: CELL * 6, background: '#22C55E20' }} />
        {/* Yellow - bottom left */}
        <div className="absolute border border-yellow-400/30" style={{ left: 0, top: CELL * 9, width: CELL * 6, height: CELL * 6, background: '#EAB30820' }} />
        
        {/* Center finish area */}
        <div className="absolute" style={{ left: CELL * 6, top: CELL * 6, width: CELL * 3, height: CELL * 3 }}>
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/40 font-cyber">🏆</div>
        </div>

        {/* Home column colors */}
        <div className="absolute" style={{ left: CELL * 7, top: CELL, width: CELL, height: CELL * 5, background: '#EF444440' }} />
        <div className="absolute" style={{ left: CELL, top: CELL * 7, width: CELL * 5, height: CELL, background: '#3B82F640' }} />
        <div className="absolute" style={{ left: CELL * 7, top: CELL * 9, width: CELL, height: CELL * 5, background: '#22C55E40' }} />
        <div className="absolute" style={{ left: CELL * 9, top: CELL * 7, width: CELL * 5, height: CELL, background: '#EAB30840' }} />

        {/* Grid lines */}
        {Array.from({ length: 15 }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="absolute" style={{ left: i * CELL, top: 0, width: 1, height: BOARD, background: 'rgba(255,255,255,0.05)' }} />
            <div className="absolute" style={{ top: i * CELL, left: 0, height: 1, width: BOARD, background: 'rgba(255,255,255,0.05)' }} />
          </React.Fragment>
        ))}

        {/* Home base tokens */}
        {players.map(color => (
          tokens[color].map((token, ti) => {
            if (token.pos !== -1) return null
            const [br, bc] = HOME_BASE[color][ti]
            const isMovable = turn === color && movable.includes(ti)
            return (
              <motion.div key={`${color}-${ti}`}
                whileHover={isMovable ? { scale: 1.3 } : {}}
                onClick={() => handleTokenClick(color, ti)}
                className="absolute rounded-full border-2 flex items-center justify-center font-cyber text-xs font-bold shadow-lg"
                style={{
                  left: bc * CELL + 4, top: br * CELL + 4,
                  width: CELL - 8, height: CELL - 8,
                  background: COLOR_HEX[color],
                  borderColor: isMovable ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  cursor: isMovable ? 'pointer' : 'default',
                  boxShadow: isMovable ? `0 0 12px ${COLOR_HEX[color]}, 0 0 4px white` : `0 2px 4px rgba(0,0,0,0.5)`,
                  animation: isMovable ? 'pulse 0.8s ease-in-out infinite' : 'none',
                  zIndex: 10,
                }}>
                {ti + 1}
              </motion.div>
            )
          })
        ))}

        {/* Board track tokens */}
        {Object.entries(cellTokens).map(([key, toksOnCell]) => (
          toksOnCell.map(({ color, ti, token }, idx) => {
            const [row, col] = key.split(',').map(Number)
            const isMovable = turn === color && movable.includes(ti)
            const offset = toksOnCell.length > 1 ? idx * 4 : 0
            return (
              <motion.div key={`board-${color}-${ti}`}
                whileHover={isMovable ? { scale: 1.3 } : {}}
                onClick={() => handleTokenClick(color, ti)}
                className="absolute rounded-full border-2 flex items-center justify-center font-cyber text-xs font-bold shadow-lg"
                style={{
                  left: col * CELL + 4 + offset, top: row * CELL + 4 + offset,
                  width: CELL - 10, height: CELL - 10,
                  background: COLOR_HEX[color],
                  borderColor: isMovable ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  cursor: isMovable ? 'pointer' : 'default',
                  boxShadow: isMovable ? `0 0 12px ${COLOR_HEX[color]}, 0 0 4px white` : `0 2px 4px rgba(0,0,0,0.5)`,
                  zIndex: 20 + idx,
                }}>
                {ti + 1}
              </motion.div>
            )
          })
        ))}

        {/* Safe cell markers */}
        {[1,9,14,22,27,35,40,48].map(cellIdx => {
          const pos = BOARD_CELLS[cellIdx]
          if (!pos) return null
          return (
            <div key={`safe-${cellIdx}`} className="absolute flex items-center justify-center text-xs opacity-40 pointer-events-none"
              style={{ left: pos[1] * CELL, top: pos[0] * CELL, width: CELL, height: CELL }}>⭐</div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <style>{`@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }`}</style>

      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">LUDO</h2>
        <button onClick={() => { setVsAI(!vsAI); reset() }}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2P'}
        </button>
      </div>

      {/* Scores */}
      <div className="flex gap-3">
        {players.map(color => (
          <div key={color} className="card-glass rounded-xl px-4 py-2 text-center border-2 transition-all"
            style={{ borderColor: turn === color && !winner ? COLOR_HEX[color] : 'transparent' }}>
            <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: COLOR_HEX[color] }} />
            <div className="font-cyber text-xs" style={{ color: COLOR_HEX[color] }}>
              {color === 'red' ? 'YOU' : 'AI'}
            </div>
            <div className="text-xs text-white/40">
              {tokens[color].filter(t => t.pos >= 100).length}/4 done
            </div>
          </div>
        ))}
      </div>

      <div className="font-cyber text-sm text-white/60 text-center min-h-5">{msg}</div>

      {/* Board */}
      <div className="overflow-auto max-w-full">
        {renderBoard()}
      </div>

      {/* Dice + Roll button */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 card-glass rounded-xl flex items-center justify-center text-3xl border-2"
          style={{ borderColor: turn ? COLOR_HEX[turn] : 'rgba(255,255,255,0.1)' }}>
          {dice ? DICE_FACES[animDice] : '🎲'}
        </div>
        {!rolled && !winner && turn === 'red' && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => doRoll()} disabled={rolling}
            className="btn-neon text-sm py-3 px-8">
            {rolling ? 'Rolling...' : '🎲 Roll Dice'}
          </motion.button>
        )}
        {rolled && movable.length > 0 && (
          <div className="font-cyber text-xs text-neon-cyan animate-pulse">Click a token to move!</div>
        )}
      </div>

      {winner && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-3">
          <div className="font-cyber text-xl" style={{ color: COLOR_HEX[winner] }}>
            🏆 {winner === 'red' ? 'YOU WIN!' : 'AI WINS!'}
          </div>
          <button onClick={reset} className="btn-neon text-sm py-2 px-5">New Game</button>
        </motion.div>
      )}
      {!winner && <button onClick={reset} className="text-xs text-white/30 hover:text-white/60 transition-colors font-body">Reset Game</button>}
    </div>
  )
}
