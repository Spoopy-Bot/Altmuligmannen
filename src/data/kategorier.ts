import type { KategoriId } from '../types'

export interface Kategori {
  id: KategoriId
  navn: string
  eksempler: string
  /** Typisk antall timer for en vanlig jobb, brukes til prisestimat i matching. */
  typiskeTimer: number
  nokkelord: string[]
}

export const KATEGORIER: Kategori[] = [
  {
    id: 'ror',
    navn: 'Rørlegger',
    eksempler: 'Lekkasje, tett avløp, bytte kran',
    typiskeTimer: 3,
    nokkelord: ['lekk', 'drypp', 'kran', 'avløp', 'vask', 'toalett', 'rør', 'vann', 'sluk'],
  },
  {
    id: 'maling',
    navn: 'Maling',
    eksempler: 'Vegger, tak, gjerde, listverk',
    typiskeTimer: 10,
    nokkelord: ['mal', 'vegg', 'tak', 'gjerde', 'sparkel', 'tapet', 'beis', 'list'],
  },
  {
    id: 'montering',
    navn: 'Møbelmontering',
    eksempler: 'Skap, hyller, senger, TV på vegg',
    typiskeTimer: 3,
    nokkelord: ['monter', 'skap', 'hylle', 'seng', 'garderobe', 'tv', 'bord', 'skru'],
  },
  {
    id: 'hage',
    navn: 'Hagearbeid',
    eksempler: 'Hekk, plen, løv, beskjæring',
    typiskeTimer: 5,
    nokkelord: ['hekk', 'plen', 'gress', 'løv', 'tre', 'busk', 'beskjær', 'hage', 'ugress'],
  },
  {
    id: 'reparasjon',
    navn: 'Småreparasjoner',
    eksempler: 'Dører, lister, håndtak, trekk',
    typiskeTimer: 3,
    nokkelord: ['dør', 'håndtak', 'list', 'trekk', 'vindu', 'lampe', 'gardin', 'fuge', 'hengsel'],
  },
  {
    id: 'flytting',
    navn: 'Flytting og bæring',
    eksempler: 'Tunge møbler, bortkjøring',
    typiskeTimer: 3,
    nokkelord: ['flytt', 'bær', 'sofa', 'tung', 'trapp', 'kjør', 'henger'],
  },
  {
    id: 'vask',
    navn: 'Vask og rengjøring',
    eksempler: 'Vinduer, flyttevask, storrengjøring',
    typiskeTimer: 4,
    nokkelord: ['vask', 'vindu', 'rengjør', 'flyttevask', 'støv'],
  },
]

export function kategori(id: KategoriId): Kategori {
  const funnet = KATEGORIER.find((k) => k.id === id)
  if (!funnet) throw new Error(`Ukjent kategori: ${id}`)
  return funnet
}

/** Enkle jobber ungdom (15–17 år) kan ta. Resten krever opplæring eller fagbrev. */
export const UNGDOM_KATEGORIER: KategoriId[] = ['hage', 'flytting', 'vask']

export const erUngdom = (a: { alder?: number }) => a.alder !== undefined && a.alder < 18

export function kanTa(a: { alder?: number }, k: KategoriId): boolean {
  return !erUngdom(a) || UNGDOM_KATEGORIER.includes(k)
}

/** Fritt bilde (CC0 / public domain) som illustrerer jobbtypen. Se public/bilder/KILDER.md. */
export const kategoriBilde = (id: KategoriId) => `/bilder/${id}.jpg`
