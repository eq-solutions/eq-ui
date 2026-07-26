import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from '../src/Toast/Toast'
import '../src/index.css'
import './kitchen-sink.css'
import { KitchenSink } from './KitchenSink'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <KitchenSink />
    </ToastProvider>
  </StrictMode>
)
