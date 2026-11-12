/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0B0F17',
          card: '#121824',
          surface: '#1A2333',
          border: '#243047',
          red: '#E50914',
          redHover: '#F40612',
          cyan: '#00E5FF',
          gold: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(229, 9, 20, 0.45)',
        'neon-cyan': '0 0 15px rgba(0, 229, 255, 0.5)',
        'glow-screen': '0 10px 40px rgba(229, 9, 20, 0.25)',
      },
    },
  },
  plugins: [],
}

