/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      colors: {
        ember: { DEFAULT: '#ff3d00', dark: '#d93400', light: '#ff6a3d', 50: '#fff1ec' },
        ink: '#0f1424',
        night: '#12162a',
        panel: '#1a2038',
        edge: '#2a3150',
        sky: '#7cc4f0',
        mist: '#f4f6f9',
      },
      boxShadow: { card: '0 12px 32px -14px rgba(15,20,36,.28)' },
    },
  },
  plugins: [],
};
