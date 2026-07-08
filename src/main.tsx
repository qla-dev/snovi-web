import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __SNOVI_BOOT_MARK__?: (label: string, detail?: string) => void;
    __SNOVI_BOOT_DEBUG__?: boolean;
  }
}

window.__SNOVI_BOOT_MARK__?.('JS bundle evaluated', 'starting React render');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

window.__SNOVI_BOOT_MARK__?.('React render requested', 'waiting for App mount/effects');
