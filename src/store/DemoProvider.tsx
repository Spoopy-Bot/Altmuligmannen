import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { LagringsFeil } from '../components/layout/LagringsFeil'
import { nyId } from '../lib/id'
import { lagSvar } from '../lib/samtale'
import { finnAktor, finnMottaker } from '../lib/utvalg'
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

export function DemoProvider({ children }: { children: ReactNode }) {
  const [start] = useState(last)
  const [lasteFeil, settLasteFeil] = useState(start.feil)
  const [state, dispatch] = useReducer(reducer, start.state)
  const [skriver, settSkriver] = useState<Record<string, boolean>>({})
  const tidtakere = useRef<number[]>([])
  const ventende = useRef<Record<string, number[]>>({})

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
      const motpartId = megId === oppdrag.mottakerId ? oppdrag.aktorId : oppdrag.mottakerId
      const aktor = finnAktor(state, oppdrag.aktorId)
      const mottaker = finnMottaker(state, oppdrag.mottakerId)
      if (!aktor || !mottaker) return

      // Ubesvarte meldinger fra meg slås sammen, så motparten svarer på alt jeg har skrevet.
      const trad = state.meldinger.filter((m) => m.oppdragId === oppdragId)
      const sisteSvar = trad.map((m) => m.fra).lastIndexOf(motpartId)
      const ubesvarte = [...trad.slice(sisteSvar + 1).filter((m) => m.fra === megId).map((m) => m.tekst), tekst]
      const bobler = lagSvar({
        oppdrag,
        kontrakt: state.kontrakter.find((k) => k.oppdragId === oppdragId),
        aktor,
        mottaker,
        svarerErAktor: motpartId === oppdrag.aktorId,
        historikk: trad.slice(0, sisteSvar + 1),
        tekst: ubesvarte.join('. '),
      })

      ventende.current[oppdragId]?.forEach((t) => window.clearTimeout(t))
      settSkriver((s) => ({ ...s, [oppdragId]: true }))
      let forsinkelse = 0
      ventende.current[oppdragId] = bobler.map((boble, i) => {
        forsinkelse += boble.ventMs
        const t = window.setTimeout(() => {
          dispatch({ type: 'send-melding', oppdragId, fra: motpartId, tekst: boble.tekst })
          if (i === bobler.length - 1) settSkriver((s) => ({ ...s, [oppdragId]: false }))
        }, forsinkelse)
        tidtakere.current.push(t)
        return t
      })
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
