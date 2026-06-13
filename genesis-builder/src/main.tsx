import React from 'react'
import ReactDOM from 'react-dom/client'
import './ui/design/tokens.css'
import { Shell } from './ui/shell/Shell'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
)
