/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./components/**/*.html",
    "./quiz/**/*.html",
    "./scripts/**/*.js",
    "./scripts/**/*.html",
    "./data/**/*.js"
  ],
  // Safelist: ป้องกันไม่ให้ Tailwind ลบคลาสที่ถูกเรียกใช้ผ่านตัวแปร JS (Dynamic Classes)
  safelist: [
    {
      // ครอบคลุมสีและ Utility ที่ใช้ใน main.js และ data files
      pattern: /(bg|text|border|ring|shadow)-(blue|green|emerald|red|yellow|gray|indigo|teal|purple|orange|rose|amber|slate|sky)-(\d+)(\/(10|20|30|40|50|60|70|80|90))?/,
      variants: ['hover', 'dark', 'dark:hover', 'group-hover', 'dark:group-hover'],
    }
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
      },
      height: {
        screen: '100dvh',
      },
      minHeight: {
        screen: '100dvh',
      }
    },
  },
  plugins: [],
}