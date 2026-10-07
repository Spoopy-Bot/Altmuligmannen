import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { LagringsFeil } from '../components/layout/LagringsFeil'
import { nyId } from '../lib/id'
import type { DemoState } from '../types'
import { DemoContext, type DemoApi } from './context'
import { reducer } from './reducer'
import { lagStartState, STATE_VERSJON } from './seed'

const NOKKEL = 'altmuligmannen-demo'

type Lastet = { state: DemoState; feil: boolean }

function last(): Lastet {
  try {
    const raw = localStorage.getItem(NOKKEL)
    if (!raw) return { state: lagStartState(), feil: false }
    const parsed = JSON.parse(raw) as DemoState
    if (parsed.versjon !== STATE_VERSJON || !Array.isArray(parsed.oppdrag)) {
      return { state: lagStartState(), feil: false }
    }
    return { state: parsed, feil: false }
  } catch {
    return { state: lagStartState(), feil: true }
  }
}

const AUTOSVAR_MOTTAKER = [
  'Takk! Det høres bra ut.',
  'Supert, da gjør vi det sånn.',
  'Flott, jeg er hjemme da. Bare ring på.',
]
const AUTOSVAR_AKTOR = [
  'Takk for beskjed! Det ordner jeg.',
  'Notert. Jeg sier ifra hvis noe endrer seg.',
  'Det passer fint. Vi sees da!',
]

export function DemoProvider({ children }: { children: ReactNode }) {
  const [start] = useState(last)
  const [lasteFeil, settLasteFeil] = useState(start.feil)
  const [state, dispatch] = useReducer(reducer, start.state)
  const [skriver, settSkriver] = useState<Record<string, boolean>>({})
  const tidtakere = useRef<number[]>([])

  useEffect(() => {
    try {
      localStorage.setItem(NOKKEL, JSON.stringify(state))
    } catch {
      // Full eller blokkert lagring: demoen fungerer fortsatt i minnet.
    }
  }, [state])

  useEffect(() => () => tidtakere.current.forEach((t) => window.clearTimeout(t)), [])

  const megId = state.rolle === 'aktor' ? state.aktivAktorId : state.aktivMottakerId

  const opprettOppdrag = useCallback<DemoApi['opprettOppdrag']>(
    (data) => {
      const id = nyId('o')
      dispatch({ type: 'opprett-oppdrag', id, mottakerId: state.aktivMottakerId, data })
      return id
    },
    [state.aktivMottakerId],
  )

  const sendMelding = useCallback<DemoApi['sendMelding']>(
    (oppdragId, tekst) => {
      const oppdrag = state.oppdrag.find((o) => o.id === oppdragId)
      if (!oppdrag?.aktorId) return
      dispatch({ type: 'send-melding', oppdragId, fra: megId, tekst })
      const motpart = megId === oppdrag.mottakerId ? oppdrag.aktorId : oppdrag.mottakerId
      const svar = motpart === oppdrag.mottakerId ? AUTOSVAR_MOTTAKER : AUTOSVAR_AKTOR
      const antall = state.meldinger.filter((m) => m.oppdragId === oppdragId).length
      settSkriver((s) => ({ ...s, [oppdragId]: true }))
      const t = window.setTimeout(() => {
        dispatch({ type: 'send-melding', oppdragId, fra: motpart, tekst: svar[antall % svar.length] })
        settSkriver((s) => ({ ...s, [oppdragId]: false }))
      }, 1800)
      tidtakere.current.push(t)
    },
    [megId, state.oppdrag, state.meldinger],
  )

  const api = useMemo<DemoApi>(
    () => ({ state, dispatch, megId, opprettOppdrag, sendMelding, skriver }),
    [state, megId, opprettOppdrag, sendMelding, skriver],
  )

  return (
    <DemoContext.Provider value={api}>
      {lasteFeil ? (
        <LagringsFeil
          onNullstill={() => {
            dispatch({ type: 'nullstill' })
            settLasteFeil(false)
          }}
        />
      ) : (
        children
      )}
    </DemoContext.Provider>
  )
}
