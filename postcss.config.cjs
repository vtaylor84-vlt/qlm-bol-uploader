// postcss.config.cjs (COMPLETE, FINAL SCRIPT - Using the highly stable CommonJS syntax)
module.exports = {
  plugins: [
    // Using require() and the default package names is the most stable method for Netlify CJS builds
    require('tailwindcss'), 
    require('autoprefixer'),
  ],
};