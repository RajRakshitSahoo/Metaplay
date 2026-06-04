import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import TicTacToe from '../../games/TicTacToe'
import ConnectFour from '../../games/ConnectFour'
import MemoryMatch from '../../games/MemoryMatch'
import Sudoku from '../../games/Sudoku'
import Minesweeper from '../../games/Minesweeper'
import Game2048 from '../../games/Game2048'
import ReactionTest from '../../games/ReactionTest'
import TypingGame from '../../games/TypingGame'
import RPS from '../../games/RPS'
import NumberGuess from '../../games/NumberGuess'
import WordScramble from '../../games/WordScramble'
import QuizBattle from '../../games/QuizBattle'
import AimTrainer from '../../games/AimTrainer'
import Chess from '../../games/Chess'
import Battleship from '../../games/Battleship'
import DotsAndBoxes from '../../games/DotsAndBoxes'
import Ludo from '../../games/Ludo'
import Checkers from '../../games/Checkers'
import Gomoku from '../../games/Gomoku'
import TerritoryConquest from '../../games/TerritoryConquest'

const GAME_COMPONENTS = {
  tictactoe: TicTacToe,
  connectfour: ConnectFour,
  chess: Chess,
  memory: MemoryMatch,
  sudoku: Sudoku,
  minesweeper: Minesweeper,
  '2048': Game2048,
  reaction: ReactionTest,
  typing: TypingGame,
  rps: RPS,
  numberguess: NumberGuess,
  wordscramble: WordScramble,
  quiz: QuizBattle,
  aim: AimTrainer,
  battleship: Battleship,
  dots: DotsAndBoxes,
  ludo: Ludo,
  checkers: Checkers,
  gomoku: Gomoku,
  territory: TerritoryConquest,
}

export default function SinglePlayerGame({ game, onBack }) {
  const GameComponent = GAME_COMPONENTS[game.id]
  if (!GameComponent) {
    return (
      <div className="p-6 text-center">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm font-body mx-auto transition-colors">
          <FiArrowLeft /> Back
        </button>
        <div className="card-glass rounded-xl p-12 max-w-md mx-auto border border-white/5">
          <div className="text-6xl mb-4">{game.icon}</div>
          <h2 className="font-cyber text-xl text-white mb-2">{game.name}</h2>
          <p className="text-white/40 font-body text-sm mb-6">Coming soon! Full multiplayer version available in online mode.</p>
          <button onClick={onBack} className="btn-neon text-sm py-2 px-6">← Back to Lobby</button>
        </div>
      </div>
    )
  }
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white mb-4 text-sm font-body transition-colors">
        <FiArrowLeft /> {game.name} — Solo Mode
      </button>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <GameComponent />
      </motion.div>
    </div>
  )
}
