// Sudoku.jsx
import React, { useState } from 'react'

const PUZZLE = [
  [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]
]
const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]
]

export default function Sudoku() {
  const [board, setBoard] = useState(PUZZLE.map(r => [...r]))
  const [selected, setSelected] = useState(null)
  const [errors, setErrors] = useState(new Set())
  const [won, setWon] = useState(false)

  const inputNum = (num) => {
    if (!selected || PUZZLE[selected[0]][selected[1]] !== 0) return
    const nb = board.map(r => [...r])
    nb[selected[0]][selected[1]] = num
    const newErrors = new Set(errors)
    const key = `${selected[0]}-${selected[1]}`
    if (SOLUTION[selected[0]][selected[1]] !== num) newErrors.add(key)
    else newErrors.delete(key)
    setBoard(nb); setErrors(newErrors)
    if (nb.every((row, r) => row.every((v, c) => v === SOLUTION[r][c]))) setWon(true)
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <h2 className="font-cyber text-2xl font-bold text-white">SUDOKU</h2>
      {won && <div className="font-cyber text-neon-cyan text-xl">🏆 Solved!</div>}
      <div className="border-2 border-neon-cyan/30 rounded-xl overflow-hidden">
        {board.map((row, r) => (
          <div key={r} className={`flex ${r === 2 || r === 5 ? 'border-b-2 border-neon-cyan/30' : ''}`}>
            {row.map((val, c) => {
              const isOriginal = PUZZLE[r][c] !== 0
              const isSelected = selected?.[0] === r && selected?.[1] === c
              const isError = errors.has(`${r}-${c}`)
              const sameNum = selected && board[selected[0]][selected[1]] === val && val !== 0
              return (
                <div key={c} onClick={() => !isOriginal && setSelected([r, c])}
                  className={`w-10 h-10 flex items-center justify-center font-cyber text-sm cursor-pointer border border-white/5 transition-all
                  ${c === 2 || c === 5 ? 'border-r-2 border-r-neon-cyan/30' : ''}
                  ${isSelected ? 'bg-neon-cyan/20' : sameNum ? 'bg-neon-cyan/10' : isOriginal ? 'bg-white/3' : 'hover:bg-white/8'}
                  ${isOriginal ? 'text-white font-bold' : isError ? 'text-red-400' : 'text-neon-cyan'}`}>
                  {val || ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => inputNum(n)}
            className="w-9 h-9 card-glass rounded font-cyber text-neon-cyan hover:bg-neon-cyan/20 transition-all border border-white/10">
            {n}
          </button>
        ))}
        <button onClick={() => inputNum(0)} className="w-9 h-9 card-glass rounded font-cyber text-white/40 hover:bg-white/10 transition-all border border-white/10">✕</button>
      </div>
    </div>
  )
}
