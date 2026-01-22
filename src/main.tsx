import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { initGoogleAnalytics } from './utils/analytics'
import App from './App'

// Initialize Google Analytics
initGoogleAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
