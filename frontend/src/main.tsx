import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { ErrorBoundary } from '@/common/components/ErrorBoundary';
import App from './App';
import './styles/globals.css';

// Apply theme immediately to avoid flash of wrong theme
const storedTheme = localStorage.getItem('labverse_theme') || 'system';
if (
  storedTheme === 'dark' ||
  (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);
