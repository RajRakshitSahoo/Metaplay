// Game Sound System using Web Audio API - no external files needed
class GameSoundManager {
  constructor() {
    this.ctx = null
    this.enabled = localStorage.getItem('metaplay_sound') !== 'false'
    this.volume = parseFloat(localStorage.getItem('metaplay_volume') || '0.3')
  }

  getCtx() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)() } catch { return null }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  beep(freq = 440, duration = 0.1, type = 'sine', vol = null) {
    if (!this.enabled) return
    const ctx = this.getCtx()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime((vol ?? this.volume), ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {}
  }

  // Game-specific sounds
  click() { this.beep(800, 0.05, 'sine', 0.2) }
  move() { this.beep(600, 0.08, 'sine') }
  capture() { this.beep(300, 0.15, 'sawtooth') }
  win() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.2, 'sine', 0.4), i * 120)
    })
  }
  lose() {
    [400, 300, 200].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.2, 'sawtooth', 0.3), i * 150)
    })
  }
  draw() {
    [440, 440].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.15, 'triangle', 0.25), i * 200)
    })
  }
  dice() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.beep(200 + Math.random() * 400, 0.05, 'square', 0.1), i * 60)
    }
  }
  achievement() {
    [523, 659, 784, 880, 1047].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.15, 'sine', 0.5), i * 80)
    })
  }
  levelUp() {
    [400, 500, 600, 800, 1000].forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.12, 'sine', 0.4), i * 70)
    })
  }
  button() { this.beep(1000, 0.04, 'sine', 0.15) }
  error() { this.beep(200, 0.2, 'sawtooth', 0.3) }
  notification() {
    [660, 880].forEach((f, i) => setTimeout(() => this.beep(f, 0.1, 'sine', 0.2), i * 100))
  }
  cardFlip() { this.beep(500, 0.06, 'triangle', 0.2) }
  match() {
    [660, 880, 1100].forEach((f, i) => setTimeout(() => this.beep(f, 0.1, 'sine', 0.35), i * 80))
  }
  tick() { this.beep(1200, 0.03, 'sine', 0.1) }
  bomb() { this.beep(80, 0.3, 'sawtooth', 0.5) }
  swoosh() {
    const ctx = this.getCtx()
    if (!ctx || !this.enabled) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(this.volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start(); osc.stop(ctx.currentTime + 0.15)
    } catch {}
  }

  setEnabled(v) { this.enabled = v; localStorage.setItem('metaplay_sound', v) }
  setVolume(v) { this.volume = v; localStorage.setItem('metaplay_volume', v) }
  toggle() { this.setEnabled(!this.enabled); return this.enabled }
}

export const sound = new GameSoundManager()
export default sound
