/** Tekstverktøy for samtalemodellen: normalisering, dag og klokkeslett. */

export const DAGNAVN = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']

export interface Tid {
  h: number
  m: number
}

export interface Funn<T> {
  verdi: T
  pos: number
}

const BOKSTAV = 'a-zæøå'

/** Regex for et helt ord (\b fungerer ikke med æøå). */
export function ord(kilde: string, flagg = 'g'): RegExp {
  return new RegExp(`(?<![${BOKSTAV}])(?:${kilde})(?![${BOKSTAV}])`, flagg)
}

/** Dialekt, slang og vanlige skrivefeil omskrives til bokmål før tolkning. */
const OMSKRIV: [RegExp, string][] = [
  [ord('ka|kva|hæ'), 'hva'],
  [ord('kordan|åssen|hvordn|hvorda'), 'hvordan'],
  [ord('kor|hvorr'), 'hvor'],
  [ord('kæm|kem|kven'), 'hvem'],
  [ord('ikkje|ikk|itj|ikek'), 'ikke'],
  [ord('æ|eg'), 'jeg'],
  [ord('mæ|meij'), 'meg'],
  [ord('dæ'), 'deg'],
  [ord('idag'), 'i dag'],
  [ord('imorgen|imorra|i morra|imårra|i mårra'), 'i morgen'],
  [ord('ikveld'), 'i kveld'],
  [ord('klokka|klokken|kl'), 'kl.'],
  [ord('tusen takk|tusentakk|takker|tnx|thx'), 'takk'],
  [ord('okei|okey|oki|ok'), 'ok'],
  [ord('viss'), 'hvis'],
  [ord('pengan'), 'pengene'],
  [ord('tirs'), 'tirsdag'],
  [ord('ons'), 'onsdag'],
  [ord('tors'), 'torsdag'],
  [ord('fre'), 'fredag'],
  [ord('lør'), 'lørdag'],
  [ord('søn'), 'søndag'],
]

export function normaliser(tekst: string): string {
  let t = ` ${tekst.toLowerCase().replace(/\s+/g, ' ').trim()} `
  for (const [re, ny] of OMSKRIV) t = t.replace(re, ny)
  return t.replace(/kl\.\.+/g, 'kl.').replace(/\s+/g, ' ').trim()
}

export const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Stabil hash, så samme samtale alltid gir samme svar. */
export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export const pick = <T>(liste: T[], seed: number) => liste[seed % liste.length]

export function finnDag(t: string, na: Date): Funn<{ dag: number; navn: string }> | undefined {
  const relativ: [RegExp, number, string][] = [
    [/i overmorgen/, 2, 'i overmorgen'],
    [/i morgen/, 1, 'i morgen'],
    [/i dag|i kveld|nå i ettermiddag/, 0, 'i dag'],
  ]
  for (const [re, plus, navn] of relativ) {
    const m = re.exec(t)
    if (m) return { verdi: { dag: (na.getDay() + plus) % 7, navn }, pos: m.index }
  }
  let beste: Funn<{ dag: number; navn: string }> | undefined
  DAGNAVN.forEach((navn, dag) => {
    const pos = t.indexOf(navn)
    if (pos >= 0 && (!beste || pos < beste.pos)) beste = { verdi: { dag, navn }, pos }
  })
  return beste
}

export function finnTid(t: string): Funn<Tid> | undefined {
  const monstre: [RegExp, (m: RegExpExecArray) => Tid][] = [
    [/kl\.?\s*(\d{1,2})(?:[.:](\d{2}))?/, (m) => ({ h: Number(m[1]), m: Number(m[2] ?? 0) })],
    [/(?<![\d.,])(\d{1,2})[.:](\d{2})(?![\d])/, (m) => ({ h: Number(m[1]), m: Number(m[2]) })],
    [/(?:etter|ved|rundt|fra)\s+(\d{1,2})(?![\d.,]|\s*(?:m|kr|min|meter|timer|år))/, (m) => ({ h: Number(m[1]), m: 0 })],
    [/halv (\d{1,2})/, (m) => ({ h: Number(m[1]) - 1, m: 30 })],
    [/ettermiddag/, () => ({ h: 16, m: 0 })],
    [/formiddag/, () => ({ h: 10, m: 0 })],
    [/(?:i|på) kveld|kvelden|i kveld/, () => ({ h: 18, m: 0 })],
    [/tidlig (?:på )?morgen|om morgenen|morgen tidlig|tidlig i morgen/, () => ({ h: 8, m: 0 })],
    [/lunsj|middagstid/, () => ({ h: 12, m: 0 })],
  ]
  for (const [re, lag] of monstre) {
    const m = re.exec(t)
    if (!m) continue
    const tid = lag(m)
    // «kl. 3» betyr nesten alltid 15 i en håndverkersammenheng.
    if (tid.h >= 1 && tid.h <= 5 && !/natt|morgen/.test(t)) tid.h += 12
    if (tid.h <= 23 && tid.m < 60) return { verdi: tid, pos: m.index }
  }
  return undefined
}

export const klokke = (t: Tid) => `kl. ${t.h}${t.m ? `.${String(t.m).padStart(2, '0')}` : ''}`
export const desimalTid = (t: Tid) => t.h + t.m / 60
export const naar = (dag: string, tid?: Tid) => (tid ? `${dag} ${klokke(tid)}` : dag)

/** Er teksten trolig engelsk? */
export function erEngelsk(t: string): boolean {
  const treff = t.match(ord('the|is|are|you|can|when|what|how|please|thanks|hello|hi|will|tomorrow|today|price|english', 'g'))
  return (treff?.length ?? 0) >= 2 && !/[æøå]/.test(t)
}
