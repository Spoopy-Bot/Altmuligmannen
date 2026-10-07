import { ClipboardList, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { OppdragKort } from '../../components/domain/OppdragKort'
import { Avatar } from '../../components/ui/Avatar'
import { KnappLenke } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { fornavn } from '../../lib/format'
import { finnAktor, finnMottaker, harVurdert } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { DemoState, Oppdrag } from '../../types'

function nesteHandling(state: DemoState, o: Oppdrag): string | undefined {
  if (o.status === 'apen') return 'Velg en aktør'
  if (o.status === 'levert') return 'Godkjenn jobben for å frigi betalingen'
  if (o.status === 'godkjent' && !harVurdert(state, o.id, o.mottakerId)) return 'Gi en vurdering'
  return undefined
}

export function MineOppdrag() {
  const { state } = useDemo()
  const laster = useSimulertLasting()
  const [fane, settFane] = useState<'aktive' | 'fullforte'>('aktive')
  const meg = finnMottaker(state, state.aktivMottakerId)
  const mine = state.oppdrag.filter((o) => o.mottakerId === state.aktivMottakerId)
  const aktive = mine.filter((o) => o.status !== 'godkjent')
  const fullforte = mine.filter((o) => o.status === 'godkjent')
  const liste = fane === 'aktive' ? aktive : fullforte

  return (
    <div className="max-w-3xl">
      <Sidehode
        tittel={`Hei, ${meg ? fornavn(meg.navn) : ''}`}
        handlinger={
          <KnappLenke to="/hjelp/ny" variant="aksent" ikon={<PlusCircle size={18} aria-hidden />}>
            Beskriv problem
          </KnappLenke>
        }
      />

      <div role="group" aria-label="Vis oppdrag" className="mb-5 flex gap-1 border-b border-line">
        {(
          [
            ['aktive', 'Aktive', aktive.length],
            ['fullforte', 'Fullførte', fullforte.length],
          ] as const
        ).map(([id, tekst, antall]) => (
          <button
            key={id}
            type="button"
            aria-pressed={fane === id}
            onClick={() => settFane(id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              fane === id ? 'border-navy text-navy' : 'border-transparent text-ink-3 hover:text-navy'
            }`}
          >
            {tekst}
            <span className="tall rounded-md bg-cream-200 px-1.5 text-xs text-ink-2">{antall}</span>
          </button>
        ))}
      </div>

      <div>
        {laster ? (
          <SkjelettListe antall={3} etikett="Laster oppdrag" />
        ) : liste.length === 0 ? (
          <TomTilstand
            ikon={<ClipboardList size={24} aria-hidden />}
            tittel={fane === 'aktive' ? 'Ingen aktive oppdrag' : 'Ingen fullførte ennå'}
            handling={
              fane === 'aktive' && (
                <KnappLenke to="/hjelp/ny" ikon={<PlusCircle size={18} aria-hidden />}>
                  Beskriv problem
                </KnappLenke>
              )
            }
          >
            {fane === 'aktive' ? 'Beskriv hva du trenger hjelp med.' : 'Godkjente jobber havner her.'}
          </TomTilstand>
        ) : (
          <ul className="flex flex-col gap-3">
            {liste.map((o) => {
              const aktor = finnAktor(state, o.aktorId)
              return (
                <li key={o.id}>
                  <OppdragKort
                    oppdrag={o}
                    handling={nesteHandling(state, o)}
                    ekstra={
                      aktor && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
                          <Avatar navn={aktor.navn} farge={aktor.farge} storrelse="xs" />
                          {aktor.navn}
                        </span>
                      )
                    }
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
