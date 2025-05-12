import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { ModalProvider } from '@/contexts/ModalContext.jsx';
import { ToastProvider } from '@/contexts/ToastContext.jsx';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModalProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ModalProvider>
  </StrictMode>,
);
