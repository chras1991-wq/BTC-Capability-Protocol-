import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ProtocolApp from './ProtocolApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProtocolApp />
  </StrictMode>,
)
