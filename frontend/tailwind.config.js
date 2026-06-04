/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#050816', secondary: '#0F172A', card: '#111827' },
        neon: { cyan: '#00F5FF', purple: '#7C3AED', pink: '#FF00FF', yellow: '#F59E0B' },
        accent: { blue: '#38BDF8', teal: '#22D3EE' },
      },
      fontFamily: { cyber: ['Orbitron', 'monospace'], body: ['Rajdhani', 'sans-serif'] },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scanline': 'scanline 4s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseNeon: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { from: { 'box-shadow': '0 0 10px #00F5FF' }, to: { 'box-shadow': '0 0 30px #00F5FF, 0 0 60px #7C3AED' } },
        scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
