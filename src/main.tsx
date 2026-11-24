import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register service worker for offline caching & automatic silent updates across all devices
registerSW({
  immediate: true,
  onRegisterError(error) {
    console.warn('[ARSHIEL PWA] Service worker registration skipped:', error);
  },
});

createRoot(document.getElementById('root')!).render(<App />);
