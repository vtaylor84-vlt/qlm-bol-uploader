import React from 'react';
import { createRoot } from 'react-dom/client';
// ✅ Importing App.tsx from the same root folder
import App from './App.tsx'; 

// ✅ Correct path to style.css inside the src folder
import './src/style.css'; 

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    });
}