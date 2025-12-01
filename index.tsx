// index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
// ⚠️ FINAL FIX: Absolute import using the new alias (@/). 
// This bypasses the old, failing relative path ("./App.") entirely.
import App from '@/App.tsx'; 
// Assuming style.css is correctly placed in src/ based on your structure
import '@/src/style.css'; 

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Minimal Service Worker registration for PWA installability (requires separate service-worker.js file for full functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}