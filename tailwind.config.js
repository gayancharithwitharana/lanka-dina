const plugin = require('tailwindcss/plugin');

const { light, dark } = require('./src/constants/colors');

const colorNames = Object.keys(light);

function hexToRgbChannels(hex) {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

function toCssVariables(palette) {
  return Object.fromEntries(
    colorNames.map((name) => [`--color-${name}`, hexToRgbChannels(palette[name])]),
  );
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: Object.fromEntries(
        colorNames.map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
      ),
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
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': toCssVariables(light),
        '@media (prefers-color-scheme: dark)': { ':root': toCssVariables(dark) },
      });
    }),
  ],
};
