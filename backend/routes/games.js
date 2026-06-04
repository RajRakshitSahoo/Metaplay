// games.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const GAMES_LIST = [
  { id: 'tictactoe', name: 'Tic-Tac-Toe', category: 'board', icon: '⭕', minPlayers: 2, maxPlayers: 2, description: 'Classic X and O game', color: '#00F5FF' },
  { id: 'connectfour', name: 'Connect Four', category: 'board', icon: '🔴', minPlayers: 2, maxPlayers: 2, description: 'Connect 4 tokens in a row', color: '#FF6B6B' },
  { id: 'chess', name: 'Chess', category: 'board', icon: '♟️', minPlayers: 2, maxPlayers: 2, description: 'The game of kings', color: '#F59E0B' },
  { id: 'ludo', name: 'Ludo', category: 'board', icon: '🎲', minPlayers: 2, maxPlayers: 4, description: 'Race your tokens home', color: '#22D3EE' },
  { id: 'checkers', name: 'Checkers', category: 'board', icon: '🔵', minPlayers: 2, maxPlayers: 2, description: 'Capture all opponent pieces', color: '#A78BFA' },
  { id: 'gomoku', name: 'Gomoku', category: 'board', icon: '⚫', minPlayers: 2, maxPlayers: 2, description: 'Five in a row strategy', color: '#34D399' },
  { id: 'rps', name: 'Rock Paper Scissors', category: 'casual', icon: '✂️', minPlayers: 2, maxPlayers: 2, description: 'Quick reflex battle', color: '#F472B6' },
  { id: 'memory', name: 'Memory Match', category: 'casual', icon: '🃏', minPlayers: 1, maxPlayers: 2, description: 'Match the hidden cards', color: '#FB923C' },
  { id: 'typing', name: 'Typing Speed Battle', category: 'casual', icon: '⌨️', minPlayers: 1, maxPlayers: 4, description: 'Type the fastest', color: '#60A5FA' },
  { id: 'reaction', name: 'Reaction Test', category: 'quick', icon: '⚡', minPlayers: 1, maxPlayers: 2, description: 'Test your reflexes', color: '#FBBF24' },
  { id: 'sudoku', name: 'Sudoku', category: 'puzzle', icon: '🔢', minPlayers: 1, maxPlayers: 1, description: 'Classic number puzzle', color: '#818CF8' },
  { id: 'minesweeper', name: 'Minesweeper', category: 'puzzle', icon: '💣', minPlayers: 1, maxPlayers: 1, description: 'Avoid the mines', color: '#4ADE80' },
  { id: '2048', name: '2048', category: 'puzzle', icon: '🔢', minPlayers: 1, maxPlayers: 1, description: 'Slide and merge tiles', color: '#E879F9' },
  { id: 'battleship', name: 'Battleship', category: 'strategy', icon: '🚢', minPlayers: 2, maxPlayers: 2, description: 'Sink the fleet', color: '#38BDF8' },
  { id: 'dots', name: 'Dots and Boxes', category: 'strategy', icon: '📦', minPlayers: 2, maxPlayers: 2, description: 'Claim the most boxes', color: '#A3E635' },
  { id: 'numberguess', name: 'Number Guess Battle', category: 'casual', icon: '🔮', minPlayers: 1, maxPlayers: 2, description: 'Guess the secret number', color: '#FB7185' },
  { id: 'wordscramble', name: 'Word Scramble', category: 'casual', icon: '🔤', minPlayers: 1, maxPlayers: 4, description: 'Unscramble the words', color: '#FCD34D' },
  { id: 'quiz', name: 'Quiz Battle', category: 'casual', icon: '❓', minPlayers: 1, maxPlayers: 4, description: 'Test your knowledge', color: '#6EE7B7' },
  { id: 'aim', name: 'Aim Trainer', category: 'quick', icon: '🎯', minPlayers: 1, maxPlayers: 1, description: 'Train your mouse accuracy', color: '#F87171' },
  { id: 'territory', name: 'Territory Conquest', category: 'strategy', icon: '🗺️', minPlayers: 2, maxPlayers: 4, description: 'Conquer the map', color: '#34D399' },
];

router.get('/', protect, (req, res) => res.json({ success: true, games: GAMES_LIST }));
router.get('/public', (req, res) => res.json({ success: true, games: GAMES_LIST }));
router.get('/:id', (req, res) => {
  const game = GAMES_LIST.find(g => g.id === req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
  res.json({ success: true, game });
});

module.exports = router;
