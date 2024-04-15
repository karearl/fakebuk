const purgecss = require('@fullhuman/postcss-purgecss')({
    content: [
        './src/**/*.tsx', // where your TSX files are located
        './public/index.html' // if you have an HTML file that uses your CSS
    ],
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
})

module.exports = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        ...(process.env.NODE_ENV === 'production' ? [purgecss] : [])
    ]
}