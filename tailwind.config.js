/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          text: '#1f2937',      // Màu chữ đậm
          card: '#ffffff',      // Màu nền card
          border: '#e5e7eb',    // Màu viền mờ
          primary: '#ea580c',   // Màu chủ đạo
          secondary: '#f97316', // Màu phụ
          bg: '#f3f4f6',        // Màu nền web
        }
      }
    },
  },
  plugins: [],
}