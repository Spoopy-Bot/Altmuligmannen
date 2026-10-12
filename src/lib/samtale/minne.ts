import type { Melding } from '../../types'
import { DAGNAVN, finnDag, finnTid, normaliser, type Tid } from './tekst'

/** Det modellen «husker» fra tråden. */
export interface Minne {
  /** Siste tidspunkt noen har foreslått, og om motparten har sagt ja. */
  avtale?: { dag: number; dagNavn: string; tid?: Tid; fra: string; bekreftet: boolean }
  /** Tekster svareren allerede har sendt (normalisert), så modellen ikke gjentar seg. */
  sagt: string[]
  /** Har svareren stilt et spørsmål som ennå ikke er besvart? */
  apentSporsmal?: string
}

const JA = /(?:^|[\s,.!])(ja|jepp|japp|passer( fint| bra)?|går (fint|bra)|notert|perfekt|supert|avtale|ok|fint|deal|bekreftet|sees)(?=$|[\s,.!])/

export function lesMinne(historikk: Melding[], svarerId: string): Minne {
  const minne: Minne = { sagt: [] }
  historikk.forEach((m, i) => {
    const t = normaliser(m.tekst)
    if (m.fra === svarerId) minne.sagt.push(t)

    const dag = finnDag(t, new Date(m.tid))
    const tid = finnTid(t)
    if (dag) {
      // Relative dager («i morgen») lagres som ukedag, sett fra da meldingen ble skrevet.
      minne.avtale = { dag: dag.verdi.dag, dagNavn: DAGNAVN[dag.verdi.dag], tid: tid?.verdi, fra: m.fra, bekreftet: false }
    } else if (tid && minne.avtale) {
      minne.avtale = { ...minne.avtale, tid: tid.verdi, fra: m.fra, bekreftet: false }
    }
    const svar = historikk[i + 1]
    if (minne.avtale && minne.avtale.fra === m.fra && svar && svar.fra !== m.fra && JA.test(normaliser(svar.tekst))) {
      minne.avtale.bekreftet = true
    }
    // «Passer fint» eller en ren beskjed («Da starter jeg torsdag kl. 8.») regnes som bekreftet.
    if ((dag || tid) && minne.avtale && !t.includes('?') && /passer|går fint|går bra|bekreftet|starter|kommer|tar jeg|sees/.test(t)) {
      minne.avtale.bekreftet = true
    }
  })

  const siste = historikk[historikk.length - 1]
  if (siste?.fra === svarerId && siste.tekst.includes('?')) minne.apentSporsmal = siste.tekst

  return minne
}

export function harSagt(minne: Minne, tekst: string): boolean {
  const n = normaliser(tekst).slice(0, 40)
  return minne.sagt.some((s) => s.includes(n))
}
