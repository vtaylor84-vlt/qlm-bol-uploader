import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; 

// Use relative pathing to ensure the build engine finds the file correctly
const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered');
        }).catch(err => {
            console.log('SW registration failed', err);
        });
    });
}