/** Hver person har sin egen stemme. {Nar} = tidspunkt med stor forbokstav, {nar} = med liten. */
export interface Stil {
  hei: string[]
  bekreft: string[]
  takk: string[]
  hadet: string[]
  /** Kort innledning før et svar på et spørsmål, ofte tom. */
  innled: string[]
}

const STANDARD_AKTOR: Stil = {
  hei: ['Hei {navn}!'],
  bekreft: ['{Nar} passer fint, da kommer jeg.', 'Ja, {nar} går bra.', 'Notert, jeg kommer {nar}.'],
  takk: ['Bare hyggelig!', 'Ingen årsak.', 'Flott, da er det i boks.'],
  hadet: ['Snakkes!', 'Ha en fin dag!'],
  innled: ['', 'Godt spørsmål. ', ''],
}

const STANDARD_MOTTAKER: Stil = {
  hei: ['Hei {navn}!'],
  bekreft: ['{Nar} passer fint for meg. Jeg er hjemme, bare ring på.', 'Ja, {nar} går bra.', 'Perfekt, {nar}. Da sees vi!'],
  takk: ['Takk selv!', 'Supert, takk!', 'Så bra, takk.'],
  hadet: ['Ha det bra!', 'Snakkes!'],
  innled: [''],
}

const STILER: Record<string, Partial<Stil>> = {
  'a-kai': {
    bekreft: ['{Nar} passer fint, da kommer jeg.', 'Det går fint, {nar}. Jeg forklarer gjerne underveis hva jeg gjør.'],
    hadet: ['Snakkes, {navn}!'],
  },
  'a-ingrid': {
    hei: ['Hei {navn}.'],
    bekreft: ['{Nar} er bekreftet.', '{Nar} passer. Jeg kommer presis.'],
    takk: ['Bare hyggelig.', 'Ingen årsak.'],
    innled: [''],
  },
  'a-aleksander': {
    hei: ['Heisann {navn}!', 'Hei hei!'],
    bekreft: ['{Nar} funker fint!', 'Kjør på, {nar}!'],
    takk: ['Null stress!', 'Bare hyggelig!'],
    hadet: ['Snakkes!'],
  },
  'a-henrik': {
    hei: ['God dag, {navn}.'],
    bekreft: ['{Nar} skal gå helt fint.', 'Det passer meg godt, {nar}.'],
    takk: ['Ingen årsak, det er en fornøyelse.'],
    hadet: ['Ha en riktig fin dag.'],
  },
  'a-leila': { bekreft: ['{Nar} passer perfekt!', 'Ja, {nar} går fint, jeg er fleksibel.'] },
  'a-runa': { bekreft: ['{Nar} passer fint, jeg starter med vinduene.', 'Ja, {nar} går bra.'] },
  'm-arne': {
    hei: ['Hei, {navn}.'],
    bekreft: ['{Nar} passer bra. Jeg er pensjonist, så jeg er hjemme uansett.', 'Ja, {nar} er fint.'],
  },
  'm-thomas': { bekreft: ['{Nar} passer fint, jeg har hjemmekontor.', 'Ja, {nar} går bra.'] },
  'm-solveig': { bekreft: ['{Nar} passer fint. Bare ring på, ringeklokka virker.', 'Ja, {nar} er bra.'] },
}

export function stilFor(id: string, erAktor: boolean): Stil {
  return { ...(erAktor ? STANDARD_AKTOR : STANDARD_MOTTAKER), ...STILER[id] }
}

export function fyll(mal: string, verdier: { nar?: string; navn?: string }): string {
  const nar = verdier.nar ?? ''
  return mal
    .replace('{Nar}', nar.charAt(0).toUpperCase() + nar.slice(1))
    .replace('{nar}', nar)
    .replace('{navn}', verdier.navn ?? '')
}
