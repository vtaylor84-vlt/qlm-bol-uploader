// postcss.config.js (The final, standard configuration for a Vite project)
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
    plugins: [
        tailwindcss, 
        autoprefixer,
    ],
};