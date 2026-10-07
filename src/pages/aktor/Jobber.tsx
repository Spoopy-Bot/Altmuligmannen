import { Inbox, SlidersHorizontal } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { OppdragKort } from '../../components/domain/OppdragKort'
import { KnappLenke } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { fornavn } from '../../lib/format'
import { kuraterJobber, type JobbMatch } from '../../lib/matching'
import { finnAktor } from '../../lib/utvalg'
import { useDemo } from '../../store/context'

export function Jobber() {
  const { state } = useDemo()
  const laster = useSimulertLasting()
  const meg = finnAktor(state, state.aktivAktorId)
  if (!meg) return null

  const alle = kuraterJobber(meg, state.oppdrag)
  const direkte = alle.filter((m) => m.oppdrag.status === 'forespurt')
  const naer = alle.filter((m) => m.oppdrag.status === 'apen' && m.innenforOmrade)
  const fjern = alle.filter((m) => m.oppdrag.status === 'apen' && !m.innenforOmrade)

  return (
    <div className="max-w-3xl">
      <Sidehode
        tittel={`Jobber for deg, ${fornavn(meg.navn)}`}
        handlinger={
          <KnappLenke to="/aktor/profil" variant="sekundar" storrelse="sm" ikon={<SlidersHorizontal size={16} aria-hidden />}>
            Tilpass
          </KnappLenke>
        }
      />
      {laster ? (
        <SkjelettListe antall={3} etikett="Finner jobber" />
      ) : alle.length === 0 ? (
        <TomTilstand
          ikon={<Inbox size={24} aria-hidden />}
          tittel="Ingen jobber akkurat nå"
          handling={<KnappLenke to="/aktor/profil">Utvid området</KnappLenke>}
        >
          Du får varsel når noe passer.
        </TomTilstand>
      ) : (
        <div className="flex flex-col gap-8">
          <Gruppe tittel="Forespørsler til deg" jobber={direkte} />
          <Gruppe tittel="I ditt område" jobber={naer} />
          <Gruppe tittel="Litt lenger unna" jobber={fjern} />
        </div>
      )}
    </div>
  )
}

function Gruppe({ tittel, jobber }: { tittel: string; jobber: JobbMatch[] }): ReactNode {
  const id = useId()
  if (!jobber.length) return null
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 flex items-center gap-2 text-lg font-bold text-navy">
        {tittel}
        <span className="tall rounded-md bg-cream-200 px-1.5 font-sans text-xs font-semibold text-ink-2">{jobber.length}</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {jobber.map((m) => (
          <li key={m.oppdrag.id}>
            <OppdragKort
              oppdrag={m.oppdrag}
              perspektiv="aktor"
              ekstra={<span className="text-sm text-ink-3">{m.grunner.filter((g) => g !== 'Spurt deg direkte').join(' · ')}</span>}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
