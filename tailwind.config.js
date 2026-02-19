/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
module.exports = {
    theme: {
        extend: {
            backdropBlur: {
                xs: '1px', // custom smallest blur
            }
        }
    }
}
