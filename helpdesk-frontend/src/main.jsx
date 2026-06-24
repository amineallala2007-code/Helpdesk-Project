import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' 
import './styles.css'

const savedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = savedTheme || (prefersDark ? 'dark' : 'light')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
