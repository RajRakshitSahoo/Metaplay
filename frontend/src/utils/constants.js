export const RANK_COLORS = {
  Bronze: '#CD7F32', Silver: '#C0C0C0', Gold: '#FFD700',
  Platinum: '#00F5FF', Diamond: '#B9F2FF', Master: '#FF00FF', Grandmaster: '#FF4500',
}

export const RANK_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']

export const PLAYER_LEVELS = {
  Rookie: { color: '#94a3b8', min: 1 }, Amateur: { color: '#22D3EE', min: 5 },
  Challenger: { color: '#34D399', min: 15 }, Expert: { color: '#F59E0B', min: 30 },
  Master: { color: '#A78BFA', min: 50 }, Legend: { color: '#FF00FF', min: 80 },
}

export const GAME_CATEGORIES = {
  board: { label: 'Board Games', color: '#00F5FF', icon: '♟️' },
  casual: { label: 'Casual Games', color: '#34D399', icon: '🎮' },
  puzzle: { label: 'Puzzle Games', color: '#F59E0B', icon: '🧩' },
  strategy: { label: 'Strategy', color: '#A78BFA', icon: '⚔️' },
  quick: { label: 'Quick Challenges', color: '#FB923C', icon: '⚡' },
}

export const XP_REWARDS = {
  win: 50, loss: 10, draw: 15, daily_login: 20,
  achievement: 100, tournament_win: 500, registration: 10,
}

export const formatDuration = (seconds) => {
  if (!seconds) return '0s'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60), s = seconds % 60
  return `${m}m ${s}s`
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const getRankColor = (rank) => RANK_COLORS[rank] || '#fff'

export const generateAvatar = (username) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=0F172A`
