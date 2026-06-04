# ⚡ MetaPlay — Quick Setup Guide

## 🚀 Option 1: One-Command Start (macOS/Linux)
```bash
bash start.sh
```

## 🛠️ Option 2: Manual Setup

### Step 1 — Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Configure MongoDB

**Option A: MongoDB Atlas (Cloud — Recommended)**
1. Go to https://www.mongodb.com/atlas
2. Create a free account & cluster
3. Click "Connect" → "Drivers" → copy connection string
4. Paste into `backend/.env` as `MONGODB_URI`

**Option B: Local MongoDB**
```bash
# Install MongoDB locally, then:
mongod --dbpath /data/db
```
Default URI: `mongodb://localhost:27017/metaplay` (already set in `.env`)

### Step 3 — Configure Environment

`backend/.env` — Already pre-filled for local dev:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/metaplay
JWT_SECRET=metaplay_super_secret_key_change_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

`frontend/.env` — Already pre-filled:
```
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 4 — Run Development Servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App running on http://localhost:5173
```

### Step 5 — Open Browser
Navigate to: **http://localhost:5173**

Register a new account and start playing! 🎮

---

## 🌐 Deployment

### Deploy Backend to Render
1. Push project to GitHub
2. Go to https://render.com → New Web Service
3. Connect repo, set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = any long random string
   - `CLIENT_URL` = your Vercel frontend URL

### Deploy Frontend to Vercel
1. Go to https://vercel.com → New Project
2. Import repo, set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-backend.onrender.com`
4. Deploy!

---

## 🎮 First Steps After Launch

1. **Register** an account
2. Go to **Games** → Pick any game → Solo Mode to play
3. Create a **Private Room** and share the code with a friend
4. Create a **Tournament** from the Tournaments page
5. Add **Friends** by searching their username
6. Chat in the **Lobby** with other players

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to MongoDB` | Start MongoDB locally or update Atlas URI |
| `Socket connection failed` | Ensure backend is running on port 5000 |
| `401 Unauthorized` | Clear localStorage and login again |
| `CORS errors` | Check `CLIENT_URL` in backend `.env` matches frontend URL |
| Frontend shows blank page | Run `npm install` in frontend folder |

---

*MetaPlay v1.0.0 — Play. Compete. Conquer.* 🏆
