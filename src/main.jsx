import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import "quill/dist/quill.core.css";
import { HelmetProvider } from 'react-helmet-async'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
  <HelmetProvider>
  <App />
</HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)