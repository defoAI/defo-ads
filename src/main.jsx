// File: src/main.jsx
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Application entry point with i18n initialization.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import i18n from './i18n'

// Wait for i18n to be ready before rendering
const renderApp = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// If already initialized, render immediately
if (i18n.isInitialized) {
  renderApp()
} else {
  // Wait for initialization
  i18n.on('initialized', () => {
    renderApp()
  })
}
