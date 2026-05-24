/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          deep:    '#020b18',
          mid:     '#041830',
          surface: '#062040',
          light:   '#0a3060',
        },
        cyan:  { DEFAULT: '#00d4ff', light: '#66e8ff', dark: '#0099bb' },
        aqua:  { DEFAULT: '#00ffcc', light: '#66ffd9', dark: '#00bb99' },
        teal:  { DEFAULT: '#0af5c8' },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hover:   'rgba(255,255,255,0.10)',
          border:  'rgba(255,255,255,0.12)',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm:   ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #020b18 0%, #041830 50%, #062040 100%)',
        'cyan-gradient':  'linear-gradient(135deg, #00d4ff, #00ffcc)',
        'glass-card':     'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite',
        'bubble-rise': 'bubbleRise linear infinite',
        'gradient':    'gradientShift 4s ease infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'entrance':    'heroEntrance 0.6s ease-out forwards',
        'slide-up':    'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(0,212,255,0.3)' },
          '50%':     { boxShadow: '0 0 40px rgba(0,212,255,0.6)' },
        },
        bubbleRise: {
          '0%':   { transform: 'translateY(100vh) scale(0)', opacity: 0 },
          '10%':  { opacity: 1 },
          '90%':  { opacity: 0.5 },
          '100%': { transform: 'translateY(-20px) scale(1)', opacity: 0 },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        heroEntrance: {
          from: { opacity: 0, transform: 'translateY(40px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
