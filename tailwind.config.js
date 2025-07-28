module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kumbh: ['"Kumbh Sans"', 'sans-serif'],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.98)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
  variants: {
    extend: {
      scrollbar: ['rounded'],
    },
  },
};
