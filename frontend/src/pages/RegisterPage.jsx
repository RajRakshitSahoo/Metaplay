import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const result = await register(form.username, form.email, form.password)
    if (result?.success) {
      toast.success('Account created! Welcome to MetaPlay! 🎮')
      navigate('/app')
    } else {
      toast.error(result?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 cyber-bg relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl font-bold glow-cyan">M</div>
            <span className="font-cyber text-xl font-bold text-neon-cyan">META<span className="text-white">PLAY</span></span>
          </Link>
          <h1 className="font-cyber text-2xl font-bold text-white mb-2">JOIN THE ARENA</h1>
          <p className="text-white/40 text-sm font-body">Create your gaming identity</p>
        </div>

        <div className="card-glass rounded-xl p-8 border border-neon-purple/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-cyber text-white/50 tracking-widest mb-2">USERNAME</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="input-cyber pl-11" placeholder="GamerTag" required minLength={3} maxLength={20} />
              </div>
            </div>
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
                  className="input-cyber pl-11 pr-11" placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-cyber text-white/50 tracking-widest mb-2">CONFIRM PASSWORD</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
                  className="input-cyber pl-11" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full btn-purple py-4 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {isLoading ? <div className="cyber-spinner w-5 h-5 border-2" /> : '⚡ CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6 font-body">
            Already playing?{' '}
            <Link to="/login" className="text-neon-cyan hover:text-neon-cyan/80 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
