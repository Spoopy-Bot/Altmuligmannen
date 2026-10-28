import aktorer from '../data/aktorer.json'
import kontrakter from '../data/kontrakter.json'
import meldinger from '../data/meldinger.json'
import mottakere from '../data/mottakere.json'
import oppdrag from '../data/oppdrag.json'
import ratings from '../data/ratings.json'
import varsler from '../data/varsler.json'
import type { Aktor, DemoState, KategoriId, Kontrakt, Melding, Mottaker, Oppdrag, Rating, Varsel } from '../types'

export const STATE_VERSJON = 11

export const STANDARD_VILKAR = [
  'Beløpet er reservert hos Altmuligmannen og utbetales til aktøren først når kunden har godkjent jobben.',
  'Endringer i omfang eller pris avtales skriftlig i chatten før arbeidet utføres.',
  'Aktøren tar med eget verktøy og rydder etter seg.',
  'Kunden kan melde fra om mangler før godkjenning. Da holdes betalingen tilbake til saken er løst.',
]

/** Ekstra vilkår for rørleggerjobber, så husforsikringen ikke ryker. */
export const ROR_VILKAR = 'Kun enkle jobber på synlige rør. Aktøren leverer dokumentasjon på utført arbeid.'

/** Elektrisk arbeid er begrenset til det privatpersoner selv har lov til å gjøre. */
export const EL_VILKAR = 'Kun enkle jobber du selv har lov til, som lamper med støpsel og dekkplater. Ingen arbeid på fast installasjon.'

export function vilkarFor(kategori: KategoriId): string[] {
  if (kategori === 'ror') return [...STANDARD_VILKAR, ROR_VILKAR]
  if (kategori === 'el') return [...STANDARD_VILKAR, EL_VILKAR]
  return STANDARD_VILKAR
}

export function lagStartState(): DemoState {
  return {
    versjon: STATE_VERSJON,
    rolle: null,
    aktivMottakerId: 'm-emma',
    aktivAktorId: 'a-kai',
    aktorer: aktorer as Aktor[],
    mottakere: mottakere as Mottaker[],
    oppdrag: oppdrag as Oppdrag[],
    kontrakter: (kontrakter as Omit<Kontrakt, 'vilkar'>[]).map(
      (k) => ({ ...k, vilkar: vilkarFor((oppdrag as Oppdrag[]).find((o) => o.id === k.oppdragId)?.kategori ?? 'reparasjon') }) as Kontrakt,
    ),
    meldinger: meldinger as Melding[],
    varsler: varsler as Varsel[],
    ratings: ratings as Rating[],
    varselInnstillinger: {},
  }
}
