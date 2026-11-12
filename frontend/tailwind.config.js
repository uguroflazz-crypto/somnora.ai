/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        somnora: {
          deep: "#020617", // Midnight Blue
          midnight: "#0f172a",
          slate: "#1e293b",
          mist: "#94a3b8", // Readable secondary text on deep backgrounds
          accent: "#818cf8", // Soft Indigo
          gold: "#fbbf24",
          ghost: "#f8fafc",
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'slide-up': 'slide-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
