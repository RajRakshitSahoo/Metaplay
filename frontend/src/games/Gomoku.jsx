import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

const SIZE = 15

function checkWin(board, r, c, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  for (const [dr, dc] of dirs) {
    let count = 1
    for (const s of [1,-1]) {
      let nr = r+dr*s, nc = c+dc*s
      while (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===player) { count++; nr+=dr*s; nc+=dc*s }
    }
    if (count >= 5) return true
  }
  return false
}

function getAIMove(board) {
  // Try to win, then block, then center-ish random
  for (const player of ['O','X']) {
    for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
      if (!board[r][c]) {
        board[r][c] = player
        if (checkWin(board,r,c,player)) { board[r][c]=null; if(player==='O') return [r,c] }
        board[r][c] = null
      }
    }
  }
  // Play near existing pieces
  const candidates = []
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
    if (!board[r][c]) {
      let near = false
      for (let dr=-2;dr<=2;dr++) for (let dc=-2;dc<=2;dc++) {
        const nr=r+dr, nc=c+dc
        if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]) near=true
      }
      if (near) candidates.push([r,c])
    }
  }
  if (candidates.length) return candidates[Math.floor(Math.random()*candidates.length)]
  return [Math.floor(SIZE/2), Math.floor(SIZE/2)]
}

export default function Gomoku() {
  const [board, setBoard] = useState(() => Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null)))
  const [turn, setTurn] = useState('X')
  const [winner, setWinner] = useState(null)
  const [scores, setScores] = useState({X:0,O:0})
  const [vsAI, setVsAI] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastMove, setLastMove] = useState(null)

  const place = useCallback((r, c) => {
    if (board[r][c] || winner || (vsAI && turn==='O')) return
    const nb = board.map(row=>[...row])
    nb[r][c] = turn
    setBoard(nb); setLastMove([r,c])
    if (checkWin(nb,r,c,turn)) {
      setWinner(turn); setScores(s=>({...s,[turn]:s[turn]+1})); setShowConfetti(true)
      setTimeout(()=>setShowConfetti(false),3000); return
    }
    if (nb.flat().every(Boolean)) { setWinner('draw'); return }
    const next = turn==='X'?'O':'X'
    setTurn(next)
    if (vsAI && next==='O') {
      setTimeout(()=>{
        const [ar,ac] = getAIMove(nb.map(row=>[...row]))
        const ab = nb.map(row=>[...row]); ab[ar][ac]='O'
        setBoard(ab); setLastMove([ar,ac])
        if (checkWin(ab,ar,ac,'O')) {
          setWinner('O'); setScores(s=>({...s,O:s.O+1})); return
        }
        setTurn('X')
      },400)
    }
  },[board,turn,winner,vsAI])

  const reset = () => { setBoard(Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null))); setTurn('X'); setWinner(null); setLastMove(null) }
  const CELL = 32

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {showConfetti && <Confetti recycle={false} />}
      <div className="flex items-center gap-4">
        <h2 className="font-cyber text-2xl font-bold text-white">GOMOKU</h2>
        <button onClick={()=>setVsAI(!vsAI)}
          className={`px-3 py-1 text-xs font-cyber rounded border transition-all ${vsAI?'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10':'border-white/20 text-white/50'}`}>
          {vsAI?'🤖 vs AI':'👥 2P'}
        </button>
      </div>
      <div className="flex gap-4 text-center">
        {[['X',vsAI?'You':'Black','#333','#fff'],['O',vsAI?'AI':'White','#fff','#111']].map(([sym,label,bg,col])=>(
          <div key={sym} className="card-glass rounded-xl px-5 py-2 border-2" style={{borderColor:turn===sym&&!winner?'#00F5FF':'transparent'}}>
            <div className="w-6 h-6 rounded-full mx-auto mb-1 border-2" style={{background:bg,borderColor:'rgba(255,255,255,0.3)'}} />
            <div className="font-cyber text-lg text-white">{scores[sym]}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>
      {winner && <div className="font-cyber text-lg text-neon-cyan">{winner==='draw'?'Draw!':winner==='X'?(vsAI?'🎉 You Win!':'Black Wins!'):vsAI?'🤖 AI Wins!':'White Wins!'}</div>}
      {!winner && <div className="font-cyber text-sm text-white/50">{turn==='X'?'⚫ Black':'⚪ White'}'s Turn — connect 5 to win</div>}

      <div className="overflow-auto max-w-full">
        <div className="relative rounded-xl overflow-hidden border border-white/10"
          style={{width:SIZE*CELL,height:SIZE*CELL,background:'#2a1a0a'}}>
          {/* Grid lines */}
          {Array(SIZE).fill(null).map((_,i)=>(
            <React.Fragment key={i}>
              <div className="absolute" style={{left:CELL/2+i*CELL,top:CELL/2,width:1,height:CELL*(SIZE-1),background:'rgba(255,255,255,0.2)'}} />
              <div className="absolute" style={{top:CELL/2+i*CELL,left:CELL/2,height:1,width:CELL*(SIZE-1),background:'rgba(255,255,255,0.2)'}} />
            </React.Fragment>
          ))}
          {/* Star points */}
          {[[3,3],[3,11],[11,3],[11,11],[7,7]].map(([r,c])=>(
            <div key={`${r}${c}`} className="absolute rounded-full" style={{left:CELL/2+c*CELL-3,top:CELL/2+r*CELL-3,width:6,height:6,background:'rgba(255,255,255,0.4)'}} />
          ))}
          {/* Pieces */}
          {board.map((row,r)=>row.map((cell,c)=>(
            <div key={`${r}${c}`} onClick={()=>place(r,c)}
              className="absolute cursor-pointer flex items-center justify-center"
              style={{left:c*CELL,top:r*CELL,width:CELL,height:CELL}}>
              {cell ? (
                <motion.div initial={{scale:0}} animate={{scale:1}}
                  className="rounded-full border-2 shadow-lg"
                  style={{width:CELL-6,height:CELL-6,
                    background:cell==='X'?'radial-gradient(circle at 35% 35%, #666, #111)':'radial-gradient(circle at 35% 35%, #fff, #aaa)',
                    borderColor:lastMove?.[0]===r&&lastMove?.[1]===c?'#00F5FF':'transparent',
                    boxShadow:lastMove?.[0]===r&&lastMove?.[1]===c?'0 0 8px #00F5FF':'none'}} />
              ) : (
                <div className="rounded-full opacity-0 hover:opacity-30 transition-opacity"
                  style={{width:CELL-8,height:CELL-8,background:turn==='X'?'#333':'#ddd'}} />
              )}
            </div>
          )))}
        </div>
      </div>
      <button onClick={reset} className="btn-neon text-sm py-2.5 px-8">🔄 New Game</button>
    </div>
  )
}
