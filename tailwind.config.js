/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F9FAFB',
        subtle: '#F3F4F6',
        border: '#E5E7EB',
        text: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280',
        },
        holiday: '#1D4ED8',
        poya: '#B45309',
        today: '#111827',
      },
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
