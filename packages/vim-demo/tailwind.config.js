/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vim: {
          normal: '#3b82f6', // blue - normal mode
          insert: '#22c55e', // green - insert mode
          visual: '#a855f7', // purple - visual mode
          command: '#eab308', // yellow - command mode
          replace: '#ef4444', // red - replace mode
          select: '#f97316', // orange - select mode
          search: '#f59e0b', // amber - search mode
        },
      },
    },
  },
  plugins: [],
};
