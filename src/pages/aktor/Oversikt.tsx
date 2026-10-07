import { Briefcase } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EscrowMerke } from '../../components/domain/EscrowSegl'
import { StatusMerke } from '../../components/domain/StatusMerke'
import { KnappLenke } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { dato } from '../../lib/format'
import { finnMottaker, kolonneFor, oppdragForAktor, type Kolonne } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Oppdrag } from '../../types'

const KOLONNER: { id: Kolonne; tittel: string; tom: string }[] = [
  { id: 'nye', tittel: 'Nye', tom: 'Ingen nye forespørsler' },
  { id: 'pagar', tittel: 'Pågår', tom: 'Ingen aktive jobber' },
  { id: 'fullfort', tittel: 'Fullført', tom: 'Ingen fullførte ennå' },
]

export function Oversikt() {
  const { state } = useDemo()
  const laster = useSimulertLasting()
  const [aktiv, settAktiv] = useState<Kolonne>('pagar')
  const mine = oppdragForAktor(state, state.aktivAktorId)
  const per = (k: Kolonne) => mine.filter((o) => kolonneFor(o) === k)

  return (
    <div>
      <Sidehode tittel="Mine jobber" />

      <div role="group" aria-label="Kolonne" className="mb-4 grid grid-cols-3 rounded-xl bg-white p-1 ring-1 ring-line md:hidden">
        {KOLONNER.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={aktiv === k.id}
            onClick={() => settAktiv(k.id)}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold ${
              aktiv === k.id ? 'bg-navy text-cream' : 'text-ink-2'
            }`}
          >
            {k.tittel}
            <span className="tall text-xs opacity-70">{per(k.id).length}</span>
          </button>
        ))}
      </div>

      {laster ? (
        <SkjelettListe antall={3} hoyde="h-24" etikett="Laster jobber" />
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center">
          <Briefcase className="mx-auto text-navy" size={28} aria-hidden />
          <p className="mt-3 font-semibold text-ink">Ingen jobber ennå</p>
          <KnappLenke to="/aktor/jobber" className="mt-4">
            Finn jobber
          </KnappLenke>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {KOLONNER.map((k) => {
            const liste = per(k.id)
            return (
              <section
                key={k.id}
                aria-labelledby={`kol-${k.id}`}
                className={`rounded-2xl bg-cream-200/70 p-3 ring-1 ring-line ${aktiv === k.id ? '' : 'hidden md:block'}`}
              >
                <h2 id={`kol-${k.id}`} className="mb-3 flex items-center justify-between px-1 font-display text-base font-bold text-navy">
                  {k.tittel}
                  <span className="tall rounded-md bg-white px-1.5 font-sans text-xs font-semibold text-ink-2">{liste.length}</span>
                </h2>
                {liste.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line-strong px-3 py-6 text-center text-sm text-ink-3">{k.tom}</p>
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {liste.map((o) => (
                      <li key={o.id}>
                        <JobbKort oppdrag={o} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function JobbKort({ oppdrag }: { oppdrag: Oppdrag }) {
  const { state } = useDemo()
  const kunde = finnMottaker(state, oppdrag.mottakerId)
  return (
    <Link
      to={`/oppdrag/${oppdrag.id}`}
      className="block rounded-xl bg-white p-3.5 shadow-kort ring-1 ring-line transition-shadow hover:shadow-loft"
    >
      <StatusMerke status={oppdrag.status} perspektiv="aktor" />
      <p className="mt-2 leading-snug font-semibold text-navy">{oppdrag.tittel}</p>
      <p className="mt-0.5 text-sm text-ink-3">
        {kunde?.navn} · {dato(oppdrag.opprettet)}
      </p>
      <div className="mt-2.5">
        <EscrowMerke betaling={oppdrag.betaling} />
      </div>
    </Link>
  )
}
