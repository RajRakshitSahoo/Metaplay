import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTIONS = [
  { q: 'Which game uses a "Queen" piece?', a: 'Chess', opts: ['Chess','Ludo','Checkers','Go'] },
  { q: 'In Tic-Tac-Toe, how many squares are on the board?', a: '9', opts: ['6','9','12','16'] },
  { q: 'What is the maximum score in a game of 2048?', a: 'There is no maximum', opts: ['2048','4096','8192','There is no maximum'] },
  { q: 'In Minesweeper, what does a "1" next to a cell indicate?', a: '1 adjacent mine', opts: ['1 safe cell','1 adjacent mine','1 move left','1 flag nearby'] },
  { q: 'What does WPM stand for in typing games?', a: 'Words Per Minute', opts: ['Words Per Minute','Wins Per Match','Words Per Match','Win Points Maximum'] },
  { q: 'In Connect Four, how many pieces need to connect to win?', a: '4', opts: ['3','4','5','6'] },
  { q: 'What is the highest tile you need to reach in 2048?', a: '2048', opts: ['1024','2048','4096','512'] },
  { q: 'In Battleship, how many ships does each player usually have?', a: '5', opts: ['3','4','5','6'] },
  { q: 'Rock Paper Scissors: what beats Rock?', a: 'Paper', opts: ['Scissors','Rock','Paper','None'] },
  { q: 'In Sudoku, what numbers are used to fill the grid?', a: '1-9', opts: ['0-8','1-9','1-10','0-9'] },
]

export default function QuizBattle() {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)
  const [shuffled] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 7))

  const answer = (opt) => {
    if (selected) return
    setSelected(opt)
    if (opt === shuffled[current].a) setScore(s => s + 10)
    setTimeout(() => {
      if (current + 1 >= shuffled.length) setFinished(true)
      else { setCurrent(c => c + 1); setSelected(null) }
    }, 1200)
  }

  const reset = () => { setCurrent(0); setScore(0); setSelected(null); setFinished(false) }

  if (finished) return (
    <div className="flex flex-col items-center gap-5 py-8">
      <h2 className="font-cyber text-2xl font-bold text-white">QUIZ BATTLE</h2>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-glass rounded-2xl p-8 text-center border border-neon-cyan/20">
        <div className="text-5xl mb-4">{score >= 60 ? '🏆' : score >= 40 ? '⭐' : '📚'}</div>
        <div className="font-cyber text-3xl text-neon-cyan mb-1">{score}/{shuffled.length * 10}</div>
        <div className="text-white/50 font-body">{score >= 60 ? 'Expert!' : score >= 40 ? 'Good job!' : 'Keep learning!'}</div>
        <button onClick={reset} className="mt-4 btn-neon text-sm py-2.5 px-8">Play Again</button>
      </motion.div>
    </div>
  )

  const q = shuffled[current]
  return (
    <div className="flex flex-col items-center gap-6 py-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-cyber text-xl font-bold text-white">QUIZ BATTLE</h2>
        <div className="flex gap-3">
          <span className="font-cyber text-sm text-neon-cyan">{score} pts</span>
          <span className="text-white/40 text-sm font-body">{current+1}/{shuffled.length}</span>
        </div>
      </div>

      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-500"
          style={{ width: `${((current+1)/shuffled.length)*100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }} className="card-glass rounded-2xl p-6 w-full border border-white/10">
          <p className="font-body text-lg text-white text-center">{q.q}</p>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {q.opts.map(opt => (
          <button key={opt} onClick={() => answer(opt)} disabled={!!selected}
            className={`p-3 rounded-xl font-body text-sm border transition-all
            ${!selected ? 'border-white/10 hover:border-neon-cyan/40 hover:bg-neon-cyan/5 text-white' :
              opt === q.a ? 'border-green-400 bg-green-400/15 text-green-300' :
              opt === selected ? 'border-red-400 bg-red-400/15 text-red-300' : 'border-white/5 text-white/30'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
