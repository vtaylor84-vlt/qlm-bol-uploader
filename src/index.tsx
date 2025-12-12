// index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './style.css'; // This was the last file we fixed

// Find the container element
const container = document.getElementById('root');

// If the container is not found, log an error and stop execution
if (!container) {
  throw new Error('Failed to find the root element #root in the document.');
}

// Create the root element and render the application
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}