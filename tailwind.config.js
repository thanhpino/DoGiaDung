/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          beige: '#fff8f0',
          header: '#faebd7',
          card: '#fef3e2',
          orange: '#ea8d35',
          'orange-hover': '#d47b28',
          text: '#4a3b32',
          input: '#ffffff',
          border: '#eaddcc',
          primary: '#ea580c',
          secondary: '#f97316',
          bg: '#f3f4f6',
        },
        social: {
          facebook: '#3b5998',
          facebookHover: '#2d4373',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
