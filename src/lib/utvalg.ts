import type { Aktor, DemoState, Hastegrad, Mottaker, Oppdrag, OppdragStatus } from '../types'

export function finnAktor(state: DemoState, id?: string): Aktor | undefined {
  return id ? state.aktorer.find((a) => a.id === id) : undefined
}

export function finnMottaker(state: DemoState, id?: string): Mottaker | undefined {
  return id ? state.mottakere.find((m) => m.id === id) : undefined
}

export function finnPerson(state: DemoState, id: string): { navn: string; farge: number } {
  return finnAktor(state, id) ?? finnMottaker(state, id) ?? { navn: 'Ukjent', farge: 0 }
}

export function uleste(state: DemoState, til: string): number {
  return state.varsler.filter((v) => v.til === til && !v.lest).length
}

/** Har personen allerede vurdert motparten for dette oppdraget? */
export function harVurdert(state: DemoState, oppdragId: string, fra: string): boolean {
  return state.ratings.some((r) => r.oppdragId === oppdragId && r.fra === fra)
}

export function oppdragForAktor(state: DemoState, aktorId: string): Oppdrag[] {
  return state.oppdrag.filter((o) => o.aktorId === aktorId)
}

export const STATUS_TEKST: Record<OppdragStatus, string> = {
  apen: 'Venter på aktør',
  forespurt: 'Forespørsel sendt',
  akseptert: 'Avtalt',
  pagar: 'Pågår',
  levert: 'Venter på godkjenning',
  godkjent: 'Fullført',
}

export const HASTEGRAD_TEKST: Record<Hastegrad, string> = {
  snarest: 'Haster',
  'denne-uken': 'Denne uken',
  fleksibel: 'Fleksibel',
}

export type Kolonne = 'nye' | 'pagar' | 'fullfort'

/** Hvilken kanban-kolonne et oppdrag hører til, sett fra aktøren. */
export function kolonneFor(o: Oppdrag): Kolonne {
  if (o.status === 'forespurt' || o.status === 'apen') return 'nye'
  if (o.status === 'godkjent') return 'fullfort'
  return 'pagar'
}
