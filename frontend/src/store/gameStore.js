import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  currentRoom: null,
  gameState: null,
  isInGame: false,
  spectating: null,
  lobbyMessages: [],
  onlinePlayers: 0,
  notifications: [],

  setCurrentRoom: (room) => set({ currentRoom: room, isInGame: !!room }),
  setGameState: (state) => set({ gameState: state }),
  clearGame: () => set({ currentRoom: null, gameState: null, isInGame: false }),
  
  addLobbyMessage: (msg) => set(state => ({
    lobbyMessages: [...state.lobbyMessages.slice(-99), msg]
  })),
  setLobbyMessages: (msgs) => set({ lobbyMessages: msgs }),
  
  setOnlinePlayers: (n) => set({ onlinePlayers: typeof n === 'function' ? n(get().onlinePlayers) : n }),
  incrementOnline: () => set(state => ({ onlinePlayers: state.onlinePlayers + 1 })),
  decrementOnline: () => set(state => ({ onlinePlayers: Math.max(0, state.onlinePlayers - 1) })),

  addNotification: (notif) => set(state => ({ notifications: [notif, ...state.notifications.slice(0, 49)] })),
  clearNotifications: () => set({ notifications: [] }),
}))

export default useGameStore
