/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // New Theme: Academic / Corporate (Dark Blue & Gold/Beige)
                'theme-primary': '#00205b',         // 濃紺 (Dark Blue) - Main brand color
                'theme-secondary': '#bfa46f',       // ゴールド/ベージュ (Gold/Beige) - Accents
                'theme-accent': '#707070',          // グレー (Gray) - Sub text / Borders
                'theme-accent-indigo': '#173B6C',   // 藍 (Indigo) - New Accent
                'theme-bg': '#ffffff',              // 白 (White) - Background
                'theme-input-bg': '#f4f1e8',        // 鳥の子色 (Washi) - Input Background
                'theme-surface': '#f8f9fa',         // 薄いグレー (Light Gray) - Card background
                'theme-text': '#333333',            // ダークグレー (Dark Gray) - Main text
                'theme-text-light': '#666666',      // ライトグレー (Light Gray) - Secondary text
                'theme-border': '#e0e0e0',          // ボーダー色

                // Keep backward compatibility mappings temporarily or for reference
                'japan-primary': '#00205b',
                'japan-secondary': '#bfa46f',
                'japan-bg': '#ffffff',
                'japan-text': '#333333',
                'japan-dim': '#666666',
            },
            fontFamily: {
                sans: ['"Noto Sans JP"', 'sans-serif'],
                serif: ['"Noto Serif JP"', 'serif'], // Added serif for academic feel
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'soft': '0 2px 4px rgba(0,0,0,0.05)',
                'card': '0 1px 3px rgba(0,0,0,0.1)',
            }
        },
    },
    plugins: [],
}
