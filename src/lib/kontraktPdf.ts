import type { jsPDF } from 'jspdf'
import { kategori } from '../data/kategorier'
import { stedNavn } from '../data/steder'
import type { DemoState, Kontrakt, Oppdrag } from '../types'
import { datoMedAr, desimal, klokkeslett, kr } from './format'
import { finnAktor, finnMottaker, HASTEGRAD_TEKST } from './utvalg'

const NAVY: [number, number, number] = [23, 51, 76]
const AMBER: [number, number, number] = [253, 175, 28]
const INK: [number, number, number] = [19, 33, 47]
const INK3: [number, number, number] = [93, 104, 116]
const LINJE: [number, number, number] = [228, 218, 195]
const CREAM: [number, number, number] = [251, 246, 232]

const A4_B = 210
const A4_H = 297
const MARG = 18
const BREDDE = A4_B - MARG * 2
const BILDE_B = 54
const BILDE_H = 40

/** Helvetica i PDF støtter bare WinAnsi, så smale mellomrom fra Intl byttes ut. */
const ren = (t: string) => t.replace(/[   ]/g, ' ').replace(/−/g, '-')

export const kontraktNr = (k: Kontrakt) => k.id.replace(/\D/g, '').slice(-4).padStart(4, '0')

function hendelseTid(o: Oppdrag, type: string): string | undefined {
  return o.hendelser.find((h) => h.type === type)?.tid
}

const tidspunkt = (iso?: string) => (iso ? `${datoMedAr(iso)} kl. ${klokkeslett(iso)}` : '–')

/** Lager en ferdig utfylt kontrakt som PDF for oppdraget og laster den ned. */
export async function lastNedKontraktPdf(state: DemoState, kontrakt: Kontrakt): Promise<void> {
  const oppdrag = state.oppdrag.find((o) => o.id === kontrakt.oppdragId)
  if (!oppdrag) throw new Error('Fant ikke oppdraget')
  // jsPDF er stor, så den lastes først når noen faktisk ber om en PDF.
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const aktor = finnAktor(state, kontrakt.aktorId)
  const mottaker = finnMottaker(state, kontrakt.mottakerId)
  const nr = kontraktNr(kontrakt)
  const lev = oppdrag.levering
  const startet = hendelseTid(oppdrag, 'startet')
  const levert = hendelseTid(oppdrag, 'levert')
  const godkjent = hendelseTid(oppdrag, 'godkjent')

  let y = 0

  const tekst = (t: string, x: number, yy: number, opt?: Parameters<jsPDF['text']>[3]) => doc.text(ren(t), x, yy, opt)
  const farge = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2])

  function plass(h: number) {
    if (y + h > A4_H - 22) {
      doc.addPage()
      y = MARG
    }
  }

  function overskrift(n: number, t: string) {
    // Plass til overskriften pluss litt innhold, så den ikke blir stående alene nederst på siden.
    plass(34)
    y += 4
    doc.setFillColor(...AMBER)
    doc.roundedRect(MARG, y - 4.2, 6, 6, 1.4, 1.4, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    farge(NAVY)
    tekst(String(n), MARG + 3, y - 0.1, { align: 'center' })
    doc.setFontSize(12)
    tekst(t, MARG + 9, y)
    y += 6
  }

  function avsnitt(t: string, str = 10, stil: 'normal' | 'bold' | 'italic' = 'normal', c = INK) {
    doc.setFont('helvetica', stil)
    doc.setFontSize(str)
    farge(c)
    const linjer = doc.splitTextToSize(ren(t), BREDDE) as string[]
    const lh = str * 0.42
    for (const l of linjer) {
      plass(lh + 1)
      doc.text(l, MARG, y)
      y += lh
    }
    y += 1.5
  }

  function bilder(liste: string[], tom: string) {
    plass(BILDE_H + 4)
    if (!liste.length) {
      doc.setDrawColor(...LINJE)
      doc.setFillColor(...CREAM)
      doc.setLineDashPattern([1.5, 1.2], 0)
      doc.roundedRect(MARG, y, BILDE_B, BILDE_H, 2, 2, 'FD')
      doc.setLineDashPattern([], 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      farge(INK3)
      const l = doc.splitTextToSize(tom, BILDE_B - 8) as string[]
      doc.text(l, MARG + BILDE_B / 2, y + BILDE_H / 2 - (l.length - 1) * 1.8, { align: 'center' })
      y += BILDE_H + 4
      return
    }
    liste.slice(0, 3).forEach((src, i) => {
      const x = MARG + i * (BILDE_B + 4)
      try {
        const { width, height } = doc.getImageProperties(src)
        const skala = Math.min(BILDE_B / width, BILDE_H / height)
        const w = width * skala
        const h = height * skala
        doc.setFillColor(...CREAM)
        doc.roundedRect(x, y, BILDE_B, BILDE_H, 2, 2, 'F')
        doc.addImage(src, 'JPEG', x + (BILDE_B - w) / 2, y + (BILDE_H - h) / 2, w, h)
      } catch {
        doc.setFillColor(...CREAM)
        doc.roundedRect(x, y, BILDE_B, BILDE_H, 2, 2, 'F')
      }
    })
    y += BILDE_H + 4
  }

  function nokkelrad(par: [string, string][]) {
    const kol = BREDDE / par.length
    plass(13)
    par.forEach(([etikett, verdi], i) => {
      const x = MARG + i * kol
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      farge(INK3)
      tekst(etikett, x, y)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      farge(INK)
      tekst(verdi, x, y + 5)
    })
    y += 11
  }

  // Topp
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, A4_B, 34, 'F')
  doc.setFillColor(...AMBER)
  doc.roundedRect(MARG, 10, 14, 14, 3.2, 3.2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  farge(NAVY)
  tekst('A', MARG + 7, 19.4, { align: 'center' })
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  tekst('Altmuligmannen', MARG + 19, 17.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(199, 212, 225)
  tekst('Avtale om utførelse av oppdrag', MARG + 19, 23)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  tekst(`Kontrakt nr. ${nr}`, A4_B - MARG, 17.5, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(199, 212, 225)
  tekst(kontrakt.status === 'fullfort' ? 'Fullført' : 'Aktiv', A4_B - MARG, 23, { align: 'right' })

  y = 46
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  farge(NAVY)
  const tittel = doc.splitTextToSize(ren(oppdrag.tittel), BREDDE) as string[]
  doc.text(tittel, MARG, y)
  y += tittel.length * 7.2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  farge(INK3)
  tekst(`${kategori(oppdrag.kategori).navn} · ${HASTEGRAD_TEKST[oppdrag.hastegrad]} · Inngått ${tidspunkt(kontrakt.opprettet)}`, MARG, y)
  y += 9

  // Parter
  doc.setDrawColor(...LINJE)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(MARG, y, BREDDE, 26, 3, 3, 'D')
  const parter: [string, string, string][] = [
    ['Kunde', mottaker?.navn ?? '–', `${oppdrag.adresse}, ${stedNavn(oppdrag.sted)}`],
    ['Aktør', aktor?.navn ?? '–', [aktor?.firma ?? aktor?.tittel, aktor?.verifisert.id ? 'ID verifisert' : ''].filter(Boolean).join(' · ')],
  ]
  parter.forEach(([rolle, navn, linje], i) => {
    const x = MARG + 6 + i * (BREDDE / 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    farge(INK3)
    tekst(rolle.toUpperCase(), x, y + 7.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    farge(INK)
    tekst(navn, x, y + 13.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    farge(INK3)
    tekst(linje, x, y + 19)
  })
  y += 34

  overskrift(1, 'Hva skulle gjøres')
  avsnitt(kontrakt.arbeid, 10.5)
  if (oppdrag.beskrivelse !== kontrakt.arbeid) avsnitt(`Kundens beskrivelse: «${oppdrag.beskrivelse}»`, 9, 'italic', INK3)

  overskrift(2, 'Slik så det ut før')
  bilder(oppdrag.bilder, 'Kunden la ikke ved bilder')

  overskrift(3, 'Hva ble gjort')
  avsnitt(lev ? lev.utfort : 'Ikke rapportert ennå. Fylles ut når aktøren melder jobben ferdig.', 10.5, lev ? 'normal' : 'italic', lev ? INK : INK3)

  overskrift(4, 'Tidsbruk')
  nokkelrad([
    ['Startet', tidspunkt(startet)],
    ['Meldt ferdig', tidspunkt(levert)],
    ['Timer brukt', lev ? `${desimal(lev.timer)} t` : '–'],
  ])

  overskrift(5, 'Slik ble det')
  bilder(lev?.bilder ?? [], lev ? 'Aktøren la ikke ved bilde' : 'Lastes opp når jobben er ferdig')

  overskrift(6, 'Pris og betaling')
  const b = oppdrag.betaling
  nokkelrad([
    ['Avtalt pris', kr(kontrakt.pris)],
    ['Betaling', `Vipps · ${b.status === 'frigitt' ? 'utbetalt' : 'reservert'}`],
    ['Effektiv timepris', lev && lev.timer > 0 ? kr(kontrakt.pris / lev.timer) : '–'],
  ])
  avsnitt(
    `Reservert ${tidspunkt(b.reservert)}${b.vippsRef ? ` (ordre ${b.vippsRef})` : ''}.` +
      (b.frigitt ? ` Utbetalt til aktøren ${tidspunkt(b.frigitt)}.` : ' Utbetales når kunden godkjenner jobben.'),
    9,
    'normal',
    INK3,
  )

  overskrift(7, 'Vilkår')
  kontrakt.vilkar.forEach((v, i) => avsnitt(`${i + 1}. ${v}`, 9.5))

  // Signaturer
  plass(34)
  y += 4
  const sign: [string, string | undefined, string][] = [
    [mottaker?.navn ?? 'Kunde', b.reservert, godkjent ? `Godkjent ${tidspunkt(godkjent)}` : 'Ikke godkjent ennå'],
    [aktor?.navn ?? 'Aktør', kontrakt.opprettet, levert ? `Levert ${tidspunkt(levert)}` : 'Ikke levert ennå'],
  ]
  sign.forEach(([navn, tid, status], i) => {
    const x = MARG + i * (BREDDE / 2 + 3)
    const w = BREDDE / 2 - 3
    doc.setFillColor(...CREAM)
    doc.roundedRect(x, y, w, 26, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    farge(INK)
    tekst(navn, x + 5, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    farge(INK3)
    tekst(`Signert digitalt ${tidspunkt(tid)}`, x + 5, y + 14)
    tekst(status, x + 5, y + 19.5)
  })
  y += 30

  // Bunntekst på hver side
  const sider = doc.getNumberOfPages()
  for (let s = 1; s <= sider; s++) {
    doc.setPage(s)
    doc.setDrawColor(...LINJE)
    doc.line(MARG, A4_H - 14, A4_B - MARG, A4_H - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    farge(INK3)
    tekst(`Altmuligmannen AS · Kontrakt nr. ${nr} · Prototype med fiktive data`, MARG, A4_H - 9)
    tekst(`Side ${s} av ${sider}`, A4_B - MARG, A4_H - 9, { align: 'right' })
  }

  const slug = oppdrag.tittel
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  doc.setProperties({ title: `Kontrakt ${nr} – ${oppdrag.tittel}`, author: 'Altmuligmannen' })
  doc.save(`kontrakt-${nr}-${slug}.pdf`)
}
