// tailwind.config.js
module.exports = {
  // ...
  plugins: [
    require('@tailwindcss/typography'),
  ],
  theme: {
    extend: {
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.92)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-1px) scale(1.1)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s infinite ease-in-out',
        'bounce-subtle': 'bounce-subtle 1.5s infinite ease-in-out',
      }
    }
  }
}