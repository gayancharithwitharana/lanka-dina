const colors = require('./src/constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Inter'],
        sinhala: ['NotoSansSinhala'],
        tamil: ['NotoSansTamil'],
      },
      borderRadius: {
        card: '14px',
        button: '14px',
        pill: '999px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      fontSize: {
        label: ['13px', { fontWeight: '600', letterSpacing: '0.06em' }],
      },
    },
  },
  plugins: [],
};
