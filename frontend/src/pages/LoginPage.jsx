import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result?.success) {
      toast.success('Welcome back, warrior! 🎮')
      navigate('/app')
    } else {
      toast.error(result?.message || 'Login failed')
    }
  }

  const handleDemo = async () => {
    const result = await login('demo@metaplay.com', 'demo123')
    if (result?.success) { toast.success('Demo mode activated!'); navigate('/app') }
    else toast.error('Demo account not set up yet')
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 cyber-bg relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl font-bold glow-cyan">M</div>
            <span className="font-cyber text-xl font-bold text-neon-cyan">META<span className="text-white">PLAY</span></span>
          </Link>
          <h1 className="font-cyber text-2xl font-bold text-white mb-2">WELCOME BACK</h1>
          <p className="text-white/40 text-sm font-body">Sign in to continue your journey</p>
        </div>

        <div className="card-glass rounded-xl p-8 border border-neon-cyan/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-cyber text-white/50 tracking-widest mb-2">EMAIL</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="input-cyber pl-11" placeholder="your@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/50 tracking-widest mb-2">PASSWORD</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-cyber pl-11 pr-11" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full btn-neon py-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <div className="cyber-spinner w-5 h-5 border-2" /> : '🎮 SIGN IN'}
            </button>
          </form>

          <div className="mt-4">
            <button onClick={handleDemo} className="w-full py-3 text-sm font-cyber text-white/40 border border-white/10 hover:border-white/30 hover:text-white/70 transition-all rounded">
              Try Demo Account
            </button>
          </div>

          <p className="text-center text-white/40 text-sm mt-6 font-body">
            New to MetaPlay?{' '}
            <Link to="/register" className="text-neon-cyan hover:text-neon-cyan/80 font-semibold">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
