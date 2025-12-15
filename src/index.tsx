import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // App.tsx is a peer file in the same directory

// --- CSS Imports FIX ---
// 1. Import your main global styles (e.g., Tailwind base)
import './style.css'; 

// 2. Import the custom styles you moved out of index.html
// NOTE: Adjust the path if you named the file/directory differently.
import './styles/custom.css'; 

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// --- REMOVED REDUNDANT SERVICE WORKER REGISTRATION ---
// The registration script is already handled in index.html, 
// so this block is no longer needed here.