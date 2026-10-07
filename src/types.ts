export type Rolle = 'mottaker' | 'aktor'

export type KategoriId =
  | 'ror'
  | 'maling'
  | 'montering'
  | 'hage'
  | 'reparasjon'
  | 'flytting'
  | 'vask'

export interface Sted {
  by: string
  omrade: string
  lat: number
  lng: number
}

export interface TidligereJobb {
  tittel: string
  kategori: KategoriId
  ar: number
}

export interface Aktor {
  id: string
  navn: string
  tittel: string
  firma?: string
  bio: string
  kategorier: KategoriId[]
  ferdigheter: string[]
  erfaringAar: number
  timepris: number
  sted: Sted
  radiusKm: number
  tilgjengelighet: string
  ledigDenneUken: boolean
  svartid: string
  fullforteJobber: number
  verifisert: { id: boolean; forsikring: boolean; fagbrev?: string }
  tidligereJobber: TidligereJobb[]
  farge: number
}

export interface Mottaker {
  id: string
  navn: string
  sted: Sted
  medlemSiden: string
  farge: number
}

export type Hastegrad = 'snarest' | 'denne-uken' | 'fleksibel'

export type OppdragStatus =
  | 'apen'
  | 'forespurt'
  | 'akseptert'
  | 'pagar'
  | 'levert'
  | 'godkjent'

export type BetalingStatus = 'reservert' | 'frigitt'

export interface Betaling {
  belop: number
  status: BetalingStatus
  reservert: string
  frigitt?: string
}

export interface Hendelse {
  type:
    | 'opprettet'
    | 'forespurt'
    | 'avslatt'
    | 'akseptert'
    | 'startet'
    | 'levert'
    | 'godkjent'
    | 'vurdert'
  tid: string
  aktorId?: string
}

export interface Oppdrag {
  id: string
  mottakerId: string
  tittel: string
  kategori: KategoriId
  beskrivelse: string
  bilder: string[]
  hastegrad: Hastegrad
  sted: Sted
  adresse: string
  budsjett: number
  opprettet: string
  status: OppdragStatus
  aktorId?: string
  avslattAv: string[]
  kontraktId?: string
  betaling: Betaling
  hendelser: Hendelse[]
}

export type KontraktStatus = 'aktiv' | 'fullfort'

export interface Kontrakt {
  id: string
  oppdragId: string
  aktorId: string
  mottakerId: string
  opprettet: string
  pris: number
  arbeid: string
  vilkar: string[]
  status: KontraktStatus
}

export interface Melding {
  id: string
  oppdragId: string
  fra: string
  tekst: string
  tid: string
}

export type VarselType =
  | 'nytt-oppdrag'
  | 'forespørsel'
  | 'tilbud'
  | 'melding'
  | 'betaling'
  | 'oppdatering'
  | 'vurdering'

export interface Varsel {
  id: string
  til: string
  type: VarselType
  tittel: string
  tekst: string
  lenke: string
  lenketekst: string
  tid: string
  lest: boolean
}

export interface Rating {
  id: string
  oppdragId?: string
  oppdragTittel: string
  fra: string
  til: string
  stjerner: number
  kommentar: string
  dato: string
}

export interface DemoState {
  versjon: number
  rolle: Rolle | null
  aktivMottakerId: string
  aktivAktorId: string
  aktorer: Aktor[]
  mottakere: Mottaker[]
  oppdrag: Oppdrag[]
  kontrakter: Kontrakt[]
  meldinger: Melding[]
  varsler: Varsel[]
  ratings: Rating[]
}
