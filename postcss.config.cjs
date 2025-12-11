// postcss.config.cjs (The absolute final, required configuration for Netlify)
module.exports = {
  plugins: [
    // This explicitly names the package that PostCSS now uses, satisfying the error.
    require('@tailwindcss/postcss'), 
    require('autoprefixer'),
  ],
};