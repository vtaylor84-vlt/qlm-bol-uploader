// index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
// Use the absolute alias import
import App from '@/App.tsx'; 
// Assuming style.css is correctly placed in src/ based on your structure
import '@/./style.css'; 

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// REMOVED: The block for manual Service Worker registration:
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
*/