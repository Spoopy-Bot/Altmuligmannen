import aktorer from '../data/aktorer.json'
import kontrakter from '../data/kontrakter.json'
import meldinger from '../data/meldinger.json'
import mottakere from '../data/mottakere.json'
import oppdrag from '../data/oppdrag.json'
import ratings from '../data/ratings.json'
import varsler from '../data/varsler.json'
import type { Aktor, DemoState, Kontrakt, Melding, Mottaker, Oppdrag, Rating, Varsel } from '../types'

export const STATE_VERSJON = 1

export const STANDARD_VILKAR = [
  'Beløpet er reservert hos Altmuligmannen og utbetales til aktøren først når kunden har godkjent jobben.',
  'Endringer i omfang eller pris avtales skriftlig i chatten før arbeidet utføres.',
  'Aktøren tar med eget verktøy og rydder etter seg.',
  'Kunden kan melde fra om mangler før godkjenning. Da holdes betalingen tilbake til saken er løst.',
]

export function lagStartState(): DemoState {
  return {
    versjon: STATE_VERSJON,
    rolle: null,
    aktivMottakerId: 'm-emma',
    aktivAktorId: 'a-kai',
    aktorer: aktorer as Aktor[],
    mottakere: mottakere as Mottaker[],
    oppdrag: oppdrag as Oppdrag[],
    kontrakter: (kontrakter as Omit<Kontrakt, 'vilkar'>[]).map((k) => ({ ...k, vilkar: STANDARD_VILKAR }) as Kontrakt),
    meldinger: meldinger as Melding[],
    varsler: varsler as Varsel[],
    ratings: ratings as Rating[],
  }
}
