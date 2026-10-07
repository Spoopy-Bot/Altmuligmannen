import { ChevronRight, FileSignature } from 'lucide-react'
import { Segl } from '../../components/domain/Segl'
import { Link } from 'react-router'
import { Merke } from '../../components/ui/Merke'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { dato, kr } from '../../lib/format'
import { finnMottaker } from '../../lib/utvalg'
import { useDemo } from '../../store/context'

export function Avtaler() {
  const { state } = useDemo()
  const laster = useSimulertLasting()
  const mine = state.kontrakter
    .filter((k) => k.aktorId === state.aktivAktorId)
    .map((k) => ({ kontrakt: k, oppdrag: state.oppdrag.find((o) => o.id === k.oppdragId) }))
    .filter((x) => x.oppdrag)
  const reservert = mine.filter((x) => x.oppdrag!.betaling.status === 'reservert').reduce((s, x) => s + x.kontrakt.pris, 0)
  const utbetalt = mine.filter((x) => x.oppdrag!.betaling.status === 'frigitt').reduce((s, x) => s + x.kontrakt.pris, 0)

  return (
    <div className="max-w-3xl">
      <Sidehode tittel="Avtaler og betaling" />

      <dl className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber/50">
          <dt className="flex items-center gap-1.5 text-sm font-semibold text-amber-ink">
            <Segl storrelse={18} /> Reservert til deg
          </dt>
          <dd className="tall mt-1 font-display text-2xl font-extrabold text-navy">{kr(reservert)}</dd>
        </div>
        <div data-mork className="rounded-2xl bg-navy p-4 text-cream">
          <dt className="flex items-center gap-1.5 text-sm font-semibold text-navy-200">
            <Segl status="frigitt" storrelse={18} /> Utbetalt
          </dt>
          <dd className="tall mt-1 font-display text-2xl font-extrabold">{kr(utbetalt)}</dd>
        </div>
      </dl>

      {laster ? (
        <SkjelettListe antall={3} hoyde="h-20" etikett="Laster avtaler" />
      ) : mine.length === 0 ? (
        <TomTilstand ikon={<FileSignature size={24} aria-hidden />} tittel="Ingen avtaler ennå">
          Avtaler opprettes når du takker ja.
        </TomTilstand>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {mine.map(({ kontrakt, oppdrag }) => {
            const kunde = finnMottaker(state, kontrakt.mottakerId)
            const frigitt = oppdrag!.betaling.status === 'frigitt'
            return (
              <li key={kontrakt.id}>
                <Link to={`/kontrakter/${kontrakt.id}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream sm:px-5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-navy">{oppdrag!.tittel}</span>
                    <span className="block text-sm text-ink-3">
                      {kunde?.navn} · {dato(kontrakt.opprettet)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="tall font-semibold text-ink">{kr(kontrakt.pris)}</span>
                    {frigitt ? (
                      <Merke tone="ok">Utbetalt {oppdrag!.betaling.frigitt && dato(oppdrag!.betaling.frigitt)}</Merke>
                    ) : (
                      <Merke tone="amber">Reservert</Merke>
                    )}
                  </span>
                  <ChevronRight size={18} className="text-ink-3" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
