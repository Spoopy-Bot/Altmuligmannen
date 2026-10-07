import { kategori } from '../data/kategorier'
import type { Aktor, Oppdrag, Rating } from '../types'
import { kr, km, snitt } from './format'
import { avstandKm } from './geo'

export type Behov = Pick<Oppdrag, 'kategori' | 'tittel' | 'beskrivelse' | 'sted' | 'budsjett' | 'hastegrad'>

export interface Match {
  aktor: Aktor
  /** 0–100 */
  score: number
  avstand: number
  innenforOmrade: boolean
  estimertPris: number
  ratingSnitt: number
  antallVurderinger: number
  overBudsjett: boolean
  grunner: string[]
}

export function ratingFor(aktorId: string, ratings: Rating[]) {
  const egne = ratings.filter((r) => r.til === aktorId)
  return { snitt: snitt(egne.map((r) => r.stjerner)), antall: egne.length }
}

function treffPaFerdigheter(aktor: Aktor, behov: Behov): string | undefined {
  const tekst = `${behov.tittel} ${behov.beskrivelse}`.toLowerCase()
  return aktor.ferdigheter.find((f) =>
    f
      .toLowerCase()
      .split(/[\s,/]+/)
      .some((ord) => ord.length > 3 && tekst.includes(ord.slice(0, 5))),
  )
}

/**
 * Enkel, forklarbar matching: kategori er et krav, deretter vektes
 * erfaring, vurderinger, avstand, pris mot budsjett og tilgjengelighet.
 */
export function vurderMatch(aktor: Aktor, behov: Behov, ratings: Rating[]): Match | null {
  if (!aktor.kategorier.includes(behov.kategori)) return null

  const kat = kategori(behov.kategori)
  const avstand = avstandKm(aktor.sted, behov.sted)
  const innenforOmrade = avstand <= aktor.radiusKm
  const { snitt: ratingSnitt, antall } = ratingFor(aktor.id, ratings)
  const estimertPris = Math.round((aktor.timepris * kat.typiskeTimer) / 50) * 50
  const grunner: string[] = []

  let score = 30
  const ferdighet = treffPaFerdigheter(aktor, behov)
  if (ferdighet) {
    score += 10
    grunner.push(ferdighet)
  }

  score += Math.min(aktor.erfaringAar, 15)
  if (aktor.verifisert.fagbrev) grunner.push(aktor.verifisert.fagbrev)
  else grunner.push(`${aktor.erfaringAar} års erfaring`)


  const overBudsjett = estimertPris > behov.budsjett
  if (!overBudsjett) {
    score += 10
    grunner.push(`Ca. ${kr(estimertPris)}, innenfor budsjett`)
  }

  if (aktor.ledigDenneUken) {
    score += behov.hastegrad === 'snarest' ? 10 : 4
    if (behov.hastegrad !== 'fleksibel') grunner.push('Ledig denne uken')
  }

  // Vurdering og avstand vises allerede på kortet, så de teller bare i scoren.
  if (antall > 0) score += Math.max(0, (ratingSnitt - 3) / 2) * 15
  score += innenforOmrade ? 15 * (1 - avstand / aktor.radiusKm) + 5 : 0

  return {
    aktor,
    score: Math.min(100, Math.round(score)),
    avstand,
    innenforOmrade,
    estimertPris,
    ratingSnitt,
    antallVurderinger: antall,
    overBudsjett,
    grunner,
  }
}

export function anbefalAktorer(behov: Behov, aktorer: Aktor[], ratings: Rating[], unnta: string[] = []): Match[] {
  return aktorer
    .filter((a) => !unnta.includes(a.id))
    .map((a) => vurderMatch(a, behov, ratings))
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.score - a.score)
}

export interface JobbMatch {
  oppdrag: Oppdrag
  score: number
  avstand: number
  innenforOmrade: boolean
  grunner: string[]
}

/** Motsatt vei: hvilke oppdrag passer aktørens profil? */
export function kuraterJobber(aktor: Aktor, oppdrag: Oppdrag[]): JobbMatch[] {
  return oppdrag
    .filter((o) => (o.status === 'apen' || (o.status === 'forespurt' && o.aktorId === aktor.id)) && !o.avslattAv.includes(aktor.id))
    .map((o) => {
      const avstand = avstandKm(aktor.sted, o.sted)
      const innenforOmrade = avstand <= aktor.radiusKm
      const passerKategori = aktor.kategorier.includes(o.kategori)
      const grunner: string[] = []
      let score = 0
      if (o.aktorId === aktor.id) {
        score += 40
        grunner.push('Spurt deg direkte')
      }
      if (passerKategori) score += 30
      if (innenforOmrade) {
        score += 20 * (1 - avstand / aktor.radiusKm) + 5
        grunner.push(`${km(avstand)} unna`)
      } else {
        grunner.push(`${km(avstand)} unna`)
      }
      const estimert = aktor.timepris * kategori(o.kategori).typiskeTimer
      if (o.budsjett >= estimert) score += 10
      else grunner.push('Under din vanlige pris')
      if (o.hastegrad === 'snarest') score += 5
      return { oppdrag: o, score: Math.round(score), avstand, innenforOmrade, grunner, passerKategori }
    })
    .filter((m) => m.passerKategori)
    .sort((a, b) => b.score - a.score)
    .map((m) => ({ oppdrag: m.oppdrag, score: m.score, avstand: m.avstand, innenforOmrade: m.innenforOmrade, grunner: m.grunner }))
}
