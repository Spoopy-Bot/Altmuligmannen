import type { KategoriId } from '../types'

export interface Kategori {
  id: KategoriId
  navn: string
  eksempler: string
  /** Kort om hva kategorien dekker, vist når du beskriver problemet. */
  oversikt: string
  /** Hva som hjelper aktøren å forstå jobben. */
  tips: string
  eksempelTittel: string
  eksempelBeskrivelse: string
  /** Typisk antall timer for en vanlig jobb, brukes til prisestimat i matching. */
  typiskeTimer: number
  nokkelord: string[]
}

export const KATEGORIER: Kategori[] = [
  {
    id: 'ror',
    navn: 'Rørlegger',
    eksempler: 'Lekkasje, tett avløp, bytte kran',
    oversikt: 'Lekkasje, tett avløp, bytte kran. Kun synlige rør.',
    tips: 'Si hvor det lekker eller er tett, og om du har stengt vannet.',
    eksempelTittel: 'Drypper fra kjøkkenkranen',
    eksempelBeskrivelse: 'Det drypper fra kranen selv om den er skrudd helt igjen. Det startet i går, og skapet under er vått.',
    typiskeTimer: 3,
    nokkelord: ['lekk', 'drypp', 'kran', 'avløp', 'vask', 'toalett', 'rør', 'vann', 'sluk'],
  },
  {
    id: 'el',
    navn: 'Elektrisk',
    eksempler: 'Lamper, støpsler, skjøteledninger, dekkplater',
    oversikt: 'Lamper med støpsel, dekkplater og skjøteledninger. Ikke fast installasjon.',
    tips: 'Skriv hva som skal henges opp eller byttes, og om du har utstyret.',
    eksempelTittel: 'Henge opp tre taklamper',
    eksempelBeskrivelse: 'Tre lamper med støpsel skal opp i taket på kroker som sitter der fra før. Lampene er kjøpt.',
    typiskeTimer: 3,
    nokkelord: ['lampe', 'lys', 'pære', 'støpsel', 'stikkontakt', 'dekkplate', 'bryter', 'skjøteledning', 'varmeovn', 'strøm'],
  },
  {
    id: 'maling',
    navn: 'Maling',
    eksempler: 'Vegger, tak, gjerde, listverk',
    oversikt: 'Maling og sparkling av vegger, tak, gjerde og lister.',
    tips: 'Oppgi flate (m²), farge, og om du har kjøpt malingen.',
    eksempelTittel: 'Male soverom',
    eksempelBeskrivelse: 'Soverom på ca. 14 m². Noen små hull må sparkles. Ønsker hvitt tak og lys grå vegger. Malingen er kjøpt.',
    typiskeTimer: 10,
    nokkelord: ['mal', 'vegg', 'tak', 'gjerde', 'sparkel', 'tapet', 'beis', 'list'],
  },
  {
    id: 'montering',
    navn: 'Møbelmontering',
    eksempler: 'Skap, hyller, senger, TV på vegg',
    oversikt: 'Montering av skap, hyller, senger og TV på vegg.',
    tips: 'Skriv hva som skal monteres, veggtype og om du har verktøy og beslag.',
    eksempelTittel: 'Montere garderobeskap',
    eksempelBeskrivelse: 'To høye garderobeskap fra flatpakke skal settes sammen og festes i vegg på soverommet.',
    typiskeTimer: 3,
    nokkelord: ['monter', 'skap', 'hylle', 'seng', 'garderobe', 'tv', 'bord', 'skru'],
  },
  {
    id: 'hage',
    navn: 'Hagearbeid',
    eksempler: 'Hekk, plen, løv, beskjæring',
    oversikt: 'Hekk, plen, løv og beskjæring. Avfall kan kjøres bort.',
    tips: 'Oppgi størrelse (meter eller m²), og om avfallet skal kjøres bort.',
    eksempelTittel: 'Klippe tujahekk',
    eksempelBeskrivelse: 'Ca. 25 meter tujahekk som må klippes, i tillegg til løvrydding på plenen. Hageavfallet må kjøres bort.',
    typiskeTimer: 5,
    nokkelord: ['hekk', 'plen', 'gress', 'løv', 'tre', 'busk', 'beskjær', 'hage', 'ugress'],
  },
  {
    id: 'reparasjon',
    navn: 'Småreparasjoner',
    eksempler: 'Dører, lister, håndtak, trekk',
    oversikt: 'Dører, lister, håndtak og tette vinduer.',
    tips: 'Skriv hva som er ødelagt eller trekker, og hvor i huset.',
    eksempelTittel: 'Dør som subber i gulvet',
    eksempelBeskrivelse: 'To innerdører subber mot gulvet og må justeres. Håndtakene er slitte og skal byttes.',
    typiskeTimer: 3,
    nokkelord: ['dør', 'håndtak', 'list', 'trekk', 'vindu', 'lampe', 'gardin', 'fuge', 'hengsel'],
  },
  {
    id: 'flytting',
    navn: 'Flytting og bæring',
    eksempler: 'Tunge møbler, bortkjøring',
    oversikt: 'Bæring av tunge møbler og bortkjøring.',
    tips: 'Skriv hva som skal bæres, vekt, trapper og om du trenger to personer.',
    eksempelTittel: 'Bære sofa opp trapp',
    eksempelBeskrivelse: 'En tung sovesofa og en heltre kommode skal bæres opp en smal trapp. Trenger to personer.',
    typiskeTimer: 3,
    nokkelord: ['flytt', 'bær', 'sofa', 'tung', 'trapp', 'kjør', 'henger'],
  },
  {
    id: 'vask',
    navn: 'Vask og rengjøring',
    eksempler: 'Vinduer, flyttevask, storrengjøring',
    oversikt: 'Vindusvask, flyttevask og storrengjøring.',
    tips: 'Oppgi areal eller antall rom og vinduer, og om du har utstyr.',
    eksempelTittel: 'Flyttevask av leilighet',
    eksempelBeskrivelse: 'Leilighet på 60 m² skal vaskes før overlevering. Kjøkken, bad og 8 vinduer. Utstyr finnes.',
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
