import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import { router } from './router.js';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('#root is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
