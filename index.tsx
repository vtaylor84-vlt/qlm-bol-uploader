import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; 

// Import the CSS from the src folder since that's where you said it is
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

// Minimal Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => {
            console.log('SW registration failed', err);
        });
    });
}