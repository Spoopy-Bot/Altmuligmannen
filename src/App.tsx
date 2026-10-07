import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { AppSkall } from './components/layout/AppSkall'
import { KreverRolle, KreverValgtRolle } from './components/layout/KreverRolle'
import { Avtaler } from './pages/aktor/Avtaler'
import { Jobber } from './pages/aktor/Jobber'
import { Oversikt } from './pages/aktor/Oversikt'
import { Profil } from './pages/aktor/Profil'
import { IkkeFunnet } from './pages/felles/IkkeFunnet'
import { Kontrakt } from './pages/felles/Kontrakt'
import { Meldinger } from './pages/felles/Meldinger'
import { OppdragDetalj } from './pages/felles/OppdragDetalj'
import { Samtale } from './pages/felles/Samtale'
import { Varsler } from './pages/felles/Varsler'
import { AktorProfil } from './pages/mottaker/AktorProfil'
import { Aktorer } from './pages/mottaker/Aktorer'
import { Anbefalte } from './pages/mottaker/Anbefalte'
import { MineOppdrag } from './pages/mottaker/MineOppdrag'
import { NyttBehov } from './pages/mottaker/NyttBehov'
import { Start } from './pages/Start'

const mottaker = (side: ReactNode) => <KreverRolle rolle="mottaker">{side}</KreverRolle>
const aktor = (side: ReactNode) => <KreverRolle rolle="aktor">{side}</KreverRolle>

export function App() {
  return (
    <Routes>
      <Route index element={<Start />} />
      <Route
        element={
          <KreverValgtRolle>
            <AppSkall />
          </KreverValgtRolle>
        }
      >
        <Route path="hjelp/ny" element={mottaker(<NyttBehov />)} />
        <Route path="hjelp/ny/:id/anbefalt" element={mottaker(<Anbefalte />)} />
        <Route path="mine-oppdrag" element={mottaker(<MineOppdrag />)} />
        <Route path="aktorer" element={<Aktorer />} />
        <Route path="aktorer/:id" element={<AktorProfil />} />
        <Route path="oppdrag/:id" element={<OppdragDetalj />} />
        <Route path="kontrakter/:id" element={<Kontrakt />} />
        <Route path="aktor/jobber" element={aktor(<Jobber />)} />
        <Route path="aktor/oversikt" element={aktor(<Oversikt />)} />
        <Route path="aktor/avtaler" element={aktor(<Avtaler />)} />
        <Route path="aktor/profil" element={aktor(<Profil />)} />
        <Route path="meldinger" element={<Meldinger />} />
        <Route path="meldinger/:id" element={<Samtale />} />
        <Route path="varsler" element={<Varsler />} />
        <Route path="*" element={<IkkeFunnet />} />
      </Route>
    </Routes>
  )
}
