import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/*
      HashRouter is used deliberately: it needs zero server configuration, so
      the exact same static build runs on GitHub Pages (including project
      subpaths), Vercel, Netlify, and Cloudflare Pages without any rewrites.
    */}
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </React.StrictMode>,
);
