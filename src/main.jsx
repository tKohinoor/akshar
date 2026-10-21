import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SettingsProvider from './SettingsProvider'
import BackButtonHandler from './BackButtonHandler'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <BackButtonHandler />
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)