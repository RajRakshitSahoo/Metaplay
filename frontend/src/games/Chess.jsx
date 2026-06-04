import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

// Full chess implementation with legal moves
const PIECES = {
  wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',
  bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'
}

const INIT_BOARD = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
]

function cloneBoard(b) { return b.map(r => [...r]) }
function pieceColor(p) { return p ? p[0] : null }
function isWhite(p) { return p && p[0] === 'w' }
function isBlack(p) { return p && p[0] === 'b' }

function getLegalMoves(board, r, c, enPassant = null, castling = {wK:true,wQ:true,bK:true,bQ:true}) {
  const piece = board[r][c]
  if (!piece) return []
  const color = pieceColor(piece)
  const type = piece[1]
  const moves = []
  const opp = color === 'w' ? 'b' : 'w'

  const addIfValid = (tr, tc) => {
    if (tr < 0 || tr > 7 || tc < 0 || tc > 7) return false
    if (pieceColor(board[tr][tc]) === color) return false
    moves.push([tr, tc])
    return !board[tr][tc]
  }

  const slide = (dr, dc) => {
    let nr = r + dr, nc = c + dc
    while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
      if (pieceColor(board[nr][nc]) === color) break
      moves.push([nr, nc])
      if (board[nr][nc]) break
      nr += dr; nc += dc
    }
  }

  if (type === 'P') {
    const dir = color === 'w' ? -1 : 1
    const startRow = color === 'w' ? 6 : 1
    // Forward
    if (!board[r + dir]?.[c]) {
      moves.push([r + dir, c])
      if (r === startRow && !board[r + 2*dir]?.[c]) moves.push([r + 2*dir, c])
    }
    // Captures
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc
      if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        if (pieceColor(board[nr][nc]) === opp) moves.push([nr, nc])
        if (enPassant && enPassant[0] === nr && enPassant[1] === nc) moves.push([nr, nc])
      }
    }
  } else if (type === 'N') {
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) addIfValid(r+dr,c+dc)
  } else if (type === 'B') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr,dc)
  } else if (type === 'R') {
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc)
  } else if (type === 'Q') {
    for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc)
  } else if (type === 'K') {
    for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) addIfValid(r+dr,c+dc)
    // Castling
    const row = color === 'w' ? 7 : 0
    if (r === row && c === 4) {
      if (castling[color+'K'] && !board[row][5] && !board[row][6] && board[row][7] === color+'R') moves.push([row,6])
      if (castling[color+'Q'] && !board[row][3] && !board[row][2] && !board[row][1] && board[row][0] === color+'R') moves.push([row,2])
    }
  }
  return moves
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
    if (board[r][c] === color + 'K') return [r, c]
  return null
}

function isInCheck(board, color) {
  const king = findKing(board, color)
  if (!king) return false
  const opp = color === 'w' ? 'b' : 'w'
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (pieceColor(board[r][c]) === opp) {
      const moves = getLegalMoves(board, r, c)
      if (moves.some(([mr,mc]) => mr === king[0] && mc === king[1])) return true
    }
  }
  return false
}

function getFilteredMoves(board, r, c, enPassant, castling) {
  const piece = board[r][c]
  if (!piece) return []
  const color = pieceColor(piece)
  const raw = getLegalMoves(board, r, c, enPassant, castling)
  return raw.filter(([tr, tc]) => {
    const nb = cloneBoard(board)
    nb[tr][tc] = piece; nb[r][c] = null
    return !isInCheck(nb, color)
  })
}

function getAllMoves(board, color, enPassant, castling) {
  const all = []
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (pieceColor(board[r][c]) === color) {
      const moves = getFilteredMoves(board, r, c, enPassant, castling)
      moves.forEach(m => all.push({ from: [r,c], to: m }))
    }
  }
  return all
}

// Simple AI using piece values + position
const PIECE_VAL = { P:1, N:3, B:3, R:5, Q:9, K:100 }
function evalBoard(board) {
  let score = 0
  board.forEach((row, r) => row.forEach((p, c) => {
    if (!p) return
    const val = PIECE_VAL[p[1]] || 0
    score += p[0] === 'w' ? -val : val
    // Center bonus
    if (r >= 3 && r <= 4 && c >= 3 && c <= 4) score += p[0] === 'b' ? 0.1 : -0.1
  }))
  return score
}

function getAIMove(board, enPassant, castling) {
  const moves = getAllMoves(board, 'b', enPassant, castling)
  if (!moves.length) return null
  let best = null, bestScore = -Infinity
  for (const move of moves) {
    const nb = cloneBoard(board)
    nb[move.to[0]][move.to[1]] = nb[move.from[0]][move.from[1]]
    nb[move.from[0]][move.from[1]] = null
    const score = evalBoard(nb) + Math.random() * 0.1
    if (score > bestScore) { bestScore = score; best = move }
  }
  return best
}

export default function Chess() {
  const [board, setBoard] = useState(INIT_BOARD.map(r => [...r]))
  const [selected, setSelected] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [turn, setTurn] = useState('w')
  const [enPassant, setEnPassant] = useState(null)
  const [castling, setCastling] = useState({ wK: true, wQ: true, bK: true, bQ: true })
  const [status, setStatus] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [captured, setCaptured] = useState({ w: [], b: [] })
  const [lastMove, setLastMove] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [vsAI, setVsAI] = useState(true)
  const [aiThinking, setAiThinking] = useState(false)
  const [check, setCheck] = useState(false)
  const [promotionPending, setPromotionPending] = useState(null)

  const handleSquareClick = useCallback((r, c) => {
    if (gameOver || aiThinking) return
    if (vsAI && turn === 'b') return

    const piece = board[r][c]

    if (selected) {
      const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c)
      if (isLegal) {
        // Make the move
        const nb = cloneBoard(board)
        const moving = nb[selected[0]][selected[1]]
        const captured_piece = nb[r][c]

        // En passant capture
        if (moving[1] === 'P' && enPassant && r === enPassant[0] && c === enPassant[1]) {
          const capRow = turn === 'w' ? r + 1 : r - 1
          nb[capRow][c] = null
        }

        // Castling
        if (moving[1] === 'K' && Math.abs(c - selected[1]) === 2) {
          if (c === 6) { nb[r][5] = nb[r][7]; nb[r][7] = null }
          else { nb[r][3] = nb[r][0]; nb[r][0] = null }
        }

        nb[r][c] = moving
        nb[selected[0]][selected[1]] = null

        // Pawn promotion
        if (moving[1] === 'P' && (r === 0 || r === 7)) {
          setPromotionPending({ r, c, color: turn, board: nb })
          setSelected(null); setLegalMoves([])
          return
        }

        // Update castling rights
        const newCastling = { ...castling }
        if (moving === 'wK') { newCastling.wK = false; newCastling.wQ = false }
        if (moving === 'bK') { newCastling.bK = false; newCastling.bQ = false }
        if (selected[0] === 7 && selected[1] === 0) newCastling.wQ = false
        if (selected[0] === 7 && selected[1] === 7) newCastling.wK = false
        if (selected[0] === 0 && selected[1] === 0) newCastling.bQ = false
        if (selected[0] === 0 && selected[1] === 7) newCastling.bK = false

        // En passant target
        let newEP = null
        if (moving[1] === 'P' && Math.abs(r - selected[0]) === 2) {
          newEP = [(r + selected[0]) / 2, c]
        }

        // Update captured
        if (captured_piece) {
          setCaptured(prev => ({ ...prev, [turn]: [...prev[turn], captured_piece] }))
        }

        setBoard(nb); setLastMove([selected, [r, c]])
        setCastling(newCastling); setEnPassant(newEP)
        setSelected(null); setLegalMoves([])

        const opp = turn === 'w' ? 'b' : 'w'
        const oppMoves = getAllMoves(nb, opp, newEP, newCastling)
        const inCheck = isInCheck(nb, opp)
        setCheck(inCheck)

        if (oppMoves.length === 0) {
          if (inCheck) {
            setStatus(turn === 'w' ? '🏆 Checkmate! White wins!' : '🏆 Checkmate! Black wins!')
            if (turn === 'w') setShowConfetti(true)
          } else {
            setStatus('🤝 Stalemate! Draw!')
          }
          setGameOver(true)
          return
        }
        if (inCheck) setStatus(`${opp === 'w' ? 'White' : 'Black'} is in Check! ⚠️`)
        else setStatus('')

        const nextTurn = opp
        setTurn(nextTurn)

        if (vsAI && nextTurn === 'b') {
          setAiThinking(true)
          setTimeout(() => {
            const aiMove = getAIMove(nb, newEP, newCastling)
            if (aiMove) {
              const ab = cloneBoard(nb)
              const aiPiece = ab[aiMove.from[0]][aiMove.from[1]]
              const aiCap = ab[aiMove.to[0]][aiMove.to[1]]
              ab[aiMove.to[0]][aiMove.to[1]] = aiPiece
              ab[aiMove.from[0]][aiMove.from[1]] = null
              // AI pawn promotion - auto queen
              if (aiPiece === 'bP' && aiMove.to[0] === 7) ab[aiMove.to[0]][aiMove.to[1]] = 'bQ'
              if (aiCap) setCaptured(prev => ({ ...prev, b: [...prev.b, aiCap] }))
              setBoard(ab); setLastMove([aiMove.from, aiMove.to])
              const wMoves = getAllMoves(ab, 'w', null, newCastling)
              const wCheck = isInCheck(ab, 'w')
              setCheck(wCheck)
              if (wMoves.length === 0) {
                setStatus(wCheck ? '🏆 Checkmate! Black wins!' : '🤝 Stalemate!')
                setGameOver(true)
              } else if (wCheck) {
                setStatus('White is in Check! ⚠️')
              } else setStatus('')
              setTurn('w')
            }
            setAiThinking(false)
          }, 600)
        }
        return
      }
      // Clicked non-legal square
      if (piece && pieceColor(piece) === turn) {
        setSelected([r, c])
        setLegalMoves(getFilteredMoves(board, r, c, enPassant, castling))
        return
      }
      setSelected(null); setLegalMoves([])
      return
    }

    // No selection yet
    if (piece && pieceColor(piece) === turn) {
      setSelected([r, c])
      setLegalMoves(getFilteredMoves(board, r, c, enPassant, castling))
    }
  }, [board, selected, legalMoves, turn, enPassant, castling, gameOver, vsAI, aiThinking])

  const promoteToQueen = (pieceType) => {
    if (!promotionPending) return
    const nb = promotionPending.board
    nb[promotionPending.r][promotionPending.c] = promotionPending.color + pieceType
    setBoard(nb); setPromotionPending(null)
    const opp = promotionPending.color === 'w' ? 'b' : 'w'
    setTurn(opp)
    if (vsAI && opp === 'b') {
      setAiThinking(true)
      setTimeout(() => {
        const aiMove = getAIMove(nb, enPassant, castling)
        if (aiMove) {
          const ab = cloneBoard(nb)
          ab[aiMove.to[0]][aiMove.to[1]] = ab[aiMove.from[0]][aiMove.from[1]]
          ab[aiMove.from[0]][aiMove.from[1]] = null
          setBoard(ab); setTurn('w')
        }
        setAiThinking(false)
      }, 600)
    }
  }

  const reset = () => {
    setBoard(INIT_BOARD.map(r => [...r])); setSelected(null); setLegalMoves([])
    setTurn('w'); setEnPassant(null); setCastling({ wK:true,wQ:true,bK:true,bQ:true })
    setStatus(''); setGameOver(false); setCaptured({ w:[], b:[] }); setLastMove(null)
    setShowConfetti(false); setCheck(false); setPromotionPending(null); setAiThinking(false)
  }

  const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c
  const isLegal = (r, c) => legalMoves.some(([lr, lc]) => lr === r && lc === c)
  const isLastMove = (r, c) => lastMove && (
    (lastMove[0][0] === r && lastMove[0][1] === c) ||
    (lastMove[1][0] === r && lastMove[1][1] === c)
  )

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {showConfetti && <Confetti recycle={false} />}

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <h2 className="font-cyber text-2xl font-bold text-white">CHESS</h2>
        <button onClick={() => setVsAI(!vsAI)}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-white/20 text-white/50'}`}>
          {vsAI ? '🤖 vs AI' : '👥 2 Player'}
        </button>
        {aiThinking && <span className="text-xs text-neon-purple font-cyber animate-pulse">AI thinking...</span>}
      </div>

      {/* Captured pieces */}
      <div className="flex gap-6 text-xs font-body text-white/50">
        <div>White captured: {captured.w.map((p,i) => <span key={i}>{PIECES[p]}</span>)}</div>
        <div>Black captured: {captured.b.map((p,i) => <span key={i}>{PIECES[p]}</span>)}</div>
      </div>

      {/* Turn indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full border-2 ${turn === 'w' ? 'bg-white border-gray-400' : 'bg-gray-800 border-gray-500'}`} />
        <span className="font-cyber text-sm text-white/70">
          {gameOver ? status : aiThinking ? 'AI is thinking...' : turn === 'w' ? 'White to move' : 'Black to move'}
          {check && !gameOver ? ' ⚠️ CHECK!' : ''}
        </span>
      </div>

      {/* Board */}
      <div className="border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl">
        {/* Black side label */}
        <div className="flex justify-between px-1 py-0.5 bg-gray-900">
          {['a','b','c','d','e','f','g','h'].map(l => <span key={l} className="text-xs text-white/30 w-12 text-center font-body">{l}</span>)}
        </div>
        {board.map((row, r) => (
          <div key={r} className="flex">
            <div className="w-5 flex items-center justify-center text-xs text-white/30 bg-gray-900 font-body">{8-r}</div>
            {row.map((piece, c) => {
              const light = (r + c) % 2 === 0
              const sel = isSelected(r, c)
              const legal = isLegal(r, c)
              const last = isLastMove(r, c)
              const kingInCheck = check && piece && piece[1] === 'K' && pieceColor(piece) === turn

              let bgColor = light ? '#f0d9b5' : '#b58863'
              if (sel) bgColor = '#f6f669'
              else if (last) bgColor = light ? '#cdd26a' : '#aaa23a'
              else if (kingInCheck) bgColor = '#ff6b6b'

              return (
                <div key={c} onClick={() => handleSquareClick(r, c)}
                  className="relative flex items-center justify-center cursor-pointer select-none transition-colors"
                  style={{ width: 52, height: 52, background: bgColor }}>
                  {/* Legal move indicator */}
                  {legal && (
                    <div className={`absolute rounded-full z-10 ${piece ? 'inset-0 border-4 border-gray-800/50 rounded-none' : 'w-3 h-3 bg-gray-800/40'}`} />
                  )}
                  {/* Piece */}
                  {piece && (
                    <motion.span
                      initial={false}
                      className="text-4xl leading-none z-20 relative"
                      style={{
                        color: piece[0] === 'w' ? '#ffffff' : '#1a1a1a',
                        textShadow: piece[0] === 'w' ? '0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.3)',
                        filter: sel ? 'drop-shadow(0 0 6px rgba(255,255,0,0.8))' : 'none',
                      }}>
                      {PIECES[piece]}
                    </motion.span>
                  )}
                </div>
              )
            })}
            <div className="w-5 flex items-center justify-center text-xs text-white/30 bg-gray-900 font-body">{8-r}</div>
          </div>
        ))}
        <div className="flex justify-between px-1 py-0.5 bg-gray-900">
          {['a','b','c','d','e','f','g','h'].map(l => <span key={l} className="text-xs text-white/30 w-12 text-center font-body">{l}</span>)}
        </div>
      </div>

      {/* Promotion modal */}
      {promotionPending && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card-glass rounded-xl p-6 border border-neon-cyan/30">
            <div className="font-cyber text-white mb-4 text-center">Choose promotion piece</div>
            <div className="flex gap-3">
              {['Q','R','B','N'].map(p => (
                <button key={p} onClick={() => promoteToQueen(p)}
                  className="w-16 h-16 card-glass rounded-xl text-4xl flex items-center justify-center hover:bg-neon-cyan/20 border border-white/20 hover:border-neon-cyan/50 transition-all">
                  <span style={{ color: promotionPending.color === 'w' ? '#ffffff' : '#1a1a1a',
                    textShadow: promotionPending.color === 'w' ? '0 1px 3px rgba(0,0,0,0.9)' : 'none' }}>
                    {PIECES[promotionPending.color + p]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
