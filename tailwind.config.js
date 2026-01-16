/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Định nghĩa bộ màu "brand" mà code Stitch hay dùng
        brand: {
          text: '#1f2937',      // Màu chữ đậm (Gray-800)
          card: '#ffffff',      // Màu nền card (White)
          border: '#e5e7eb',    // Màu viền mờ (Gray-200)
          primary: '#ea580c',   // Màu chủ đạo (Cam đậm - Orange-600)
          secondary: '#f97316', // Màu phụ (Cam nhạt - Orange-500)
          bg: '#f3f4f6',        // Màu nền web (Gray-100)
        }
      }
    },
  },
  plugins: [],
}