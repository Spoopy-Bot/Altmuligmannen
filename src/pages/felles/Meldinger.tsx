import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar } from '../../components/ui/Avatar'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { relativTid } from '../../lib/format'
import { finnPerson } from '../../lib/utvalg'
import { useDemo } from '../../store/context'

export function Meldinger() {
  const { state, megId } = useDemo()
  const laster = useSimulertLasting()

  const trader = state.oppdrag
    .filter((o) => o.aktorId && (o.mottakerId === megId || o.aktorId === megId))
    .map((o) => {
      const meldinger = state.meldinger.filter((m) => m.oppdragId === o.id)
      const siste = meldinger[meldinger.length - 1]
      const motpartId = o.mottakerId === megId ? o.aktorId! : o.mottakerId
      const ulest = state.varsler.some((v) => v.til === megId && !v.lest && v.lenke === `/meldinger/${o.id}`)
      return { oppdrag: o, siste, motpart: finnPerson(state, motpartId), ulest }
    })
    .filter((t) => t.siste)
    .sort((a, b) => b.siste.tid.localeCompare(a.siste.tid))

  return (
    <div className="max-w-2xl">
      <Sidehode tittel="Meldinger" />
      {laster ? (
        <SkjelettListe antall={3} hoyde="h-20" etikett="Laster meldinger" />
      ) : trader.length === 0 ? (
        <TomTilstand ikon={<MessageCircle size={24} aria-hidden />} tittel="Ingen samtaler ennå">
          Chatten åpner når en jobb er avtalt.
        </TomTilstand>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {trader.map((t) => (
            <li key={t.oppdrag.id}>
              <Link to={`/meldinger/${t.oppdrag.id}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream sm:px-5">
                <Avatar navn={t.motpart.navn} farge={t.motpart.farge} storrelse="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`truncate ${t.ulest ? 'font-bold text-navy' : 'font-semibold text-ink'}`}>{t.motpart.navn}</span>
                    <span className="shrink-0 text-xs text-ink-3">{relativTid(t.siste.tid)}</span>
                  </span>
                  <span className="block truncate text-xs font-medium text-ink-3">{t.oppdrag.tittel}</span>
                  <span className={`block truncate text-sm ${t.ulest ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                    {t.siste.fra === megId && 'Du: '}
                    {t.siste.tekst}
                  </span>
                </span>
                {t.ulest && <span className="size-2.5 shrink-0 rounded-full bg-amber" aria-label="Ulest" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
