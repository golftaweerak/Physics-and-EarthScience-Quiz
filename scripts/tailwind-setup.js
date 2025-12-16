// scripts/tailwind-setup.js
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                kanit: ['Kanit', 'sans-serif'],
                sarabun: ['Sarabun', 'sans-serif'],
            }
        },
    },
    safelist: [
        {
            pattern: /(bg|text|border|ring|shadow)-(gray|indigo|teal|orange|rose|red|amber|green|purple|blue)-(50|100|200|300|400|500|600|700|800|900|950)/,
            variants: ['dark', 'hover', 'group-hover', 'dark:hover', 'dark:group-hover', 'focus'],
        }
    ]
}
