import { DAGNAVN, desimalTid, type Tid } from './tekst'

export type Vindu = (dag: number) => [number, number] | null

/** Leser f.eks. «Hverdager etter kl. 15 og lørdager» og gir åpningstid per ukedag. */
export function lesTilgjengelighet(tekst: string): Vindu {
  const t = tekst.toLowerCase()
  const tall = t.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})/)
  const etter = t.match(/etter kl\.? (\d{1,2})/)
  const alle = t.includes('alle dager')
  let hverdag: [number, number] = [8, 17]
  if (tall) hverdag = [Number(tall[1]), Number(tall[2])]
  else if (etter) hverdag = [Number(etter[1]), 21]
  else if (t.includes('kvelder')) hverdag = [17, 21]
  else if (t.includes('også kveld')) hverdag = [8, 21]
  const helg: [number, number] = alle ? hverdag : [9, 17]
  const hverdagOk = alle || t.includes('hverdag') || t.includes('kvelder')
  return (dag) => {
    if (dag >= 1 && dag <= 5) return hverdagOk ? hverdag : null
    if (dag === 6) return alle || /lørdag|helg/.test(t) ? helg : null
    return alle || t.includes('helg') ? helg : null
  }
}

/** Mottakerne er hjemme det meste av dagen, men ikke for tidlig eller sent. */
export const MOTTAKER_VINDU: Vindu = () => [8, 21]

export function passer(vindu: Vindu, dag: number, tid: Tid): boolean {
  const v = vindu(dag)
  return !!v && desimalTid(tid) >= v[0] && desimalTid(tid) < v[1]
}

export interface Forslag {
  dag: number
  navn: string
  tid: Tid
}

/**
 * Nærmeste tidspunkt som passer innenfor vinduet.
 * Starter på ønsket dag (eller i morgen), aldri før om en time, og kan hoppe til neste uke.
 */
export function foreslaTid(vindu: Vindu, na: Date, onsket?: { dag?: number; tid?: Tid; nesteUke?: boolean }): Forslag {
  const idag = na.getDay()
  const start = onsket?.nesteUke ? 1 : (onsket?.dag ?? (idag + 1) % 7)
  for (let i = 0; i < 8; i++) {
    const dag = (start + i) % 7
    const v = vindu(dag)
    if (!v) continue
    const erIdag = !onsket?.nesteUke && dag === idag && i < 7 && start === idag
    const tidligst = erIdag ? na.getHours() + 1 : 0
    const h = Math.min(Math.max(onsket?.tid?.h ?? Math.max(v[0], 9), v[0], tidligst), v[1] - 1)
    if (erIdag && h < tidligst) continue
    const navn = onsket?.nesteUke
      ? `${DAGNAVN[dag]} neste uke`
      : erIdag
        ? 'i dag'
        : dag === (idag + 1) % 7 && i < 7
          ? 'i morgen'
          : DAGNAVN[dag]
    return { dag, navn, tid: { h, m: onsket?.tid?.h === h ? onsket.tid.m : 0 } }
  }
  return { dag: 1, navn: 'mandag', tid: { h: 16, m: 0 } }
}

/** Flytt et tidspunkt litt, innenfor vinduet. */
export function forskyv(vindu: Vindu, dag: number, tid: Tid, timer: number): Tid | undefined {
  const ny = { h: tid.h + timer, m: tid.m }
  return passer(vindu, dag, ny) ? ny : undefined
}
