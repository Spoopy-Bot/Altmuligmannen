import { Briefcase, ClipboardList, FileSignature, MessageCircle, PlusCircle, Search, UserRound, type LucideIcon } from 'lucide-react'
import type { Rolle } from '../../types'

export interface NavPunkt {
  til: string
  tekst: string
  ikon: LucideIcon
  fremhevet?: boolean
}

export const NAV: Record<Rolle, NavPunkt[]> = {
  mottaker: [
    { til: '/mine-oppdrag', tekst: 'Mine oppdrag', ikon: ClipboardList },
    { til: '/aktorer', tekst: 'Finn hjelp', ikon: Search },
    { til: '/hjelp/ny', tekst: 'Beskriv problem', ikon: PlusCircle, fremhevet: true },
    { til: '/meldinger', tekst: 'Meldinger', ikon: MessageCircle },
  ],
  aktor: [
    { til: '/aktor/jobber', tekst: 'Jobber', ikon: Search },
    { til: '/aktor/oversikt', tekst: 'Mine jobber', ikon: Briefcase },
    { til: '/aktor/avtaler', tekst: 'Avtaler', ikon: FileSignature },
    { til: '/meldinger', tekst: 'Meldinger', ikon: MessageCircle },
    { til: '/aktor/profil', tekst: 'Profil', ikon: UserRound },
  ],
}

export const HJEM: Record<Rolle, string> = { mottaker: '/mine-oppdrag', aktor: '/aktor/jobber' }

export const DEMO_PERSONER: Record<Rolle, string[]> = {
  mottaker: ['m-emma', 'm-thomas'],
  aktor: ['a-kai', 'a-ingrid'],
}
