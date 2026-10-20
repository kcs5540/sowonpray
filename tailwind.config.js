/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif KR"', 'serif'],
        sans: ['"Pretendard"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        zen: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          border: '#EDE6DA',
          gold: '#C59B27',
          goldLight: '#FDF6E2',
          goldDark: '#8E6D15',
          ink: '#211F1C',
          sub: '#68635B',
          deep: '#121D19',
        }
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 8px rgba(245, 194, 66, 0.45))' },
          '100%': { filter: 'drop-shadow(0 0 22px rgba(245, 194, 66, 0.95))' },
        }
      }
    },
  },
  plugins: [],
}
