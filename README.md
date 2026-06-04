# 🎮 MetaPlay — Play. Compete. Conquer.

MetaPlay is a **full-stack multiplayer gaming platform** combining the best of Steam, Discord, Chess.com, Xbox Dashboard, and PlayStation Network. Built with a cyberpunk neon aesthetic, real-time multiplayer via Socket.IO, and 20+ playable games.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express.js |
| Real-time | Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| State | Zustand + React Query |
| Charts | Chart.js + react-chartjs-2 |

---

## 📁 Project Structure

```
metaplay/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # REST API routes
│   ├── middleware/       # Auth middleware
│   ├── socket/          # Socket.IO game handler
│   ├── server.js        # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/       # Route pages
│   │   ├── components/  # Reusable components
│   │   ├── games/       # Game components (20+)
│   │   ├── store/       # Zustand state
│   │   └── utils/       # Helpers, API, Socket
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Backend
cd metaplay/backend
npm install

# Frontend
cd metaplay/frontend
npm install
```

### 2. Configure Environment

```bash
cd metaplay/backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/metaplay
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `metaplay/frontend/.env`:
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd metaplay/backend
npm run dev

# Terminal 2 — Frontend
cd metaplay/frontend
npm run dev
```

Open http://localhost:5173 🎮

---

## 🎮 Features

### Games (20+)
| Category | Games |
|----------|-------|
| Board | Chess, Ludo, Tic-Tac-Toe, Connect Four, Checkers, Gomoku |
| Casual | Rock Paper Scissors, Memory Match, Typing Battle, Word Scramble, Number Guess, Quiz Battle |
| Puzzle | Sudoku, Minesweeper, 2048 |
| Strategy | Battleship, Dots & Boxes |
| Quick | Reaction Test, Aim Trainer |

### Platform Features
- ✅ User authentication (JWT)
- ✅ Real-time multiplayer (Socket.IO)
- ✅ XP & Level progression system
- ✅ Ranked system (Bronze → Grandmaster)
- ✅ Achievement badges
- ✅ Tournament system (create & join)
- ✅ Friends system with requests
- ✅ Real-time lobby & private chat
- ✅ Match history
- ✅ Global leaderboard
- ✅ Player profiles with stats
- ✅ Notifications system
- ✅ Cyberpunk neon UI with animations

---

## 🚀 Deployment

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect repo → set root to `backend/`
4. Add environment variables
5. Build command: `npm install`
6. Start command: `npm start`

### Frontend (Vercel)
1. Create project on [Vercel](https://vercel.com)
2. Connect repo → set root to `frontend/`
3. Add `VITE_API_URL=https://your-render-api.onrender.com/api`
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster at [atlas.mongodb.com](https://atlas.mongodb.com)
2. Add connection string to backend `.env`

---

## 🎨 Design System

| Variable | Value | Usage |
|----------|-------|-------|
| `bg-primary` | `#050816` | Main background |
| `neon-cyan` | `#00F5FF` | Primary accent |
| `neon-purple` | `#7C3AED` | Secondary accent |
| `neon-pink` | `#FF00FF` | Tertiary accent |
| Font | Orbitron + Rajdhani | Cyber aesthetic |

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/games` | List all games |
| POST | `/api/rooms/create` | Create game room |
| GET | `/api/rooms/:code` | Get room |
| GET | `/api/leaderboard/global` | Global leaderboard |
| GET | `/api/tournaments` | List tournaments |
| POST | `/api/tournaments/create` | Create tournament |
| POST | `/api/friends/request/:id` | Send friend request |
| GET | `/api/matchhistory/me` | My match history |
| GET | `/api/notifications` | My notifications |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `room:join` | Client → Server | Join game room |
| `room:ready` | Client → Server | Mark as ready |
| `room:updated` | Server → Client | Room state changed |
| `game:start` | Server → Client | All players ready |
| `game:move` | Client → Server | Submit a game move |
| `game:over` | Client → Server | Game ended |
| `lobby:message` | Both | Global lobby chat |
| `private:message` | Both | Direct message |
| `xp:earned` | Server → Client | XP reward notification |

---

## 👨‍💻 Built With
- **React 18** — UI framework
- **Framer Motion** — Smooth animations
- **Tailwind CSS** — Utility-first styling
- **Socket.IO** — Real-time multiplayer
- **MongoDB** — NoSQL database
- **JWT** — Secure authentication

---

*MetaPlay — Where legends are born* 🏆
