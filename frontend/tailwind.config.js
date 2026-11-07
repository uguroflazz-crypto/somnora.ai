module.exports = {
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
          accent: "#818cf8", // Soft Indigo
          gold: "#fbbf24",
          ghost: "#f8fafc",
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
