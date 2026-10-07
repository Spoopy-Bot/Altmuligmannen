import { Repeat } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useDemo } from '../../store/context'
import type { Rolle } from '../../types'
import { Knapp } from '../ui/Knapp'
import { TomTilstand } from '../ui/TomTilstand'

const NAVN: Record<Rolle, string> = { mottaker: 'mottaker (trenger hjelp)', aktor: 'aktør (tilbyr hjelp)' }

/** Viser siden bare for riktig rolle, og tilbyr bytte i stedet for å kaste brukeren ut. */
export function KreverRolle({ rolle, children }: { rolle: Rolle; children: ReactNode }) {
  const { state, dispatch } = useDemo()
  if (!state.rolle) return <Navigate to="/" replace />
  if (state.rolle === rolle) return children
  return (
    <TomTilstand
      ikon={<Repeat size={24} aria-hidden />}
      tittel="Denne siden hører til den andre rollen"
      handling={
        <Knapp onClick={() => dispatch({ type: 'sett-rolle', rolle })} ikon={<Repeat size={18} aria-hidden />}>
          Bytt til {rolle === 'aktor' ? 'aktør' : 'mottaker'}
        </Knapp>
      }
    >
      Siden er for {NAVN[rolle]}.
    </TomTilstand>
  )
}

export function KreverValgtRolle({ children }: { children: ReactNode }) {
  const { state } = useDemo()
  if (!state.rolle) return <Navigate to="/" replace />
  return children
}
