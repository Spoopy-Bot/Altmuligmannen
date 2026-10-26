import { StrictMode, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { Telefonramme } from './components/layout/Telefonramme'
import './index.css'
import { DemoProvider } from './store/DemoProvider'

const iRamme = window.self !== window.top
if (iRamme) document.documentElement.classList.add('i-telefon')

const bredSkjerm = window.matchMedia('(min-width: 700px)')
const lyttPaBredde = (varsle: () => void) => {
  bredSkjerm.addEventListener('change', varsle)
  return () => bredSkjerm.removeEventListener('change', varsle)
}

/** På brede skjermer vises appen i en telefonramme. På en ekte telefon vises den direkte. */
function Rot() {
  const bred = useSyncExternalStore(lyttPaBredde, () => bredSkjerm.matches)
  if (bred && !iRamme) return <Telefonramme />
  return (
    <BrowserRouter>
      <DemoProvider>
        <App />
      </DemoProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Rot />
  </StrictMode>,
)
