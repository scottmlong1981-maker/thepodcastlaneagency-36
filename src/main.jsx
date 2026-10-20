import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { initAnalytics } from './analytics';

initAnalytics();

// Clean URLs in production. The standalone single-file preview uses MemoryRouter
// because it is opened from disk or inside a sandboxed about:srcdoc iframe, where
// window.location is not a parseable URL and the history-based routers throw.
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : BrowserRouter;

// Preview builds can boot on a specific route (VITE_PREVIEW_ROUTE) so a single
// page can be reviewed directly. Ignored by the production build.
const initialRoute = import.meta.env.VITE_PREVIEW_ROUTE || '/';
const routerProps = import.meta.env.VITE_PREVIEW ? { initialEntries: [initialRoute] } : {};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router {...routerProps}>
      <App />
    </Router>
  </React.StrictMode>,
);
