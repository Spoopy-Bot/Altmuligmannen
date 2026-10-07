import { createContext, useContext, type Dispatch } from 'react'
import type { DemoState } from '../types'
import type { Handling, NyttOppdrag } from './reducer'

export interface DemoApi {
  state: DemoState
  dispatch: Dispatch<Handling>
  /** Id-en til personen du er nå (mottaker eller aktør). */
  megId: string
  opprettOppdrag: (data: NyttOppdrag) => string
  sendMelding: (oppdragId: string, tekst: string) => void
  /** Sant mens motparten «skriver» et automatisk svar. */
  skriver: Record<string, boolean>
}

export const DemoContext = createContext<DemoApi | null>(null)

export function useDemo(): DemoApi {
  const api = useContext(DemoContext)
  if (!api) throw new Error('useDemo må brukes inne i <DemoProvider>')
  return api
}
