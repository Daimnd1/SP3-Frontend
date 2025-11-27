import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Only toggle class, NO inline styles
document.documentElement.classList.remove('dark');

const savedSettings = localStorage.getItem('deskSettings');
if (savedSettings) {
  const { darkMode, followSystemTheme } = JSON.parse(savedSettings);
  
  if (followSystemTheme) {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark');
    }
  } else if (darkMode) {
    document.documentElement.classList.add('dark');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
