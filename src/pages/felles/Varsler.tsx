import { BellOff, BriefcaseBusiness, CheckCheck, FileSignature, MessageCircle, RefreshCw, Star, type LucideIcon } from 'lucide-react'
import { Segl } from '../../components/domain/Segl'
import { useNavigate } from 'react-router'
import { Knapp } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { relativTid } from '../../lib/format'
import { useDemo } from '../../store/context'
import type { Varsel, VarselType } from '../../types'

const IKON: Record<Exclude<VarselType, 'betaling'>, { ikon: LucideIcon; farge: string }> = {
  'nytt-oppdrag': { ikon: BriefcaseBusiness, farge: 'bg-navy text-cream' },
  forespørsel: { ikon: BriefcaseBusiness, farge: 'bg-navy text-cream' },
  tilbud: { ikon: FileSignature, farge: 'bg-navy text-cream' },
  melding: { ikon: MessageCircle, farge: 'bg-navy-100 text-navy' },
  oppdatering: { ikon: RefreshCw, farge: 'bg-navy-100 text-navy' },
  vurdering: { ikon: Star, farge: 'bg-navy-100 text-navy' },
}

export function Varsler() {
  const { state, dispatch, megId } = useDemo()
  const navigate = useNavigate()
  const mine = state.varsler.filter((v) => v.til === megId).sort((a, b) => b.tid.localeCompare(a.tid))
  const nye = mine.filter((v) => !v.lest)
  const tidligere = mine.filter((v) => v.lest)

  function apne(v: Varsel) {
    dispatch({ type: 'les-varsel', id: v.id })
    navigate(v.lenke)
  }

  return (
    <div className="max-w-2xl">
      <Sidehode
        tittel="Varsler"
        handlinger={
          nye.length > 0 && (
            <Knapp variant="tekst" storrelse="sm" ikon={<CheckCheck size={16} aria-hidden />} onClick={() => dispatch({ type: 'les-varsler', til: megId })}>
              Merk alle som lest
            </Knapp>
          )
        }
      />
      {mine.length === 0 ? (
        <TomTilstand ikon={<BellOff size={24} aria-hidden />} tittel="Ingen varsler">
          Her dukker nye oppdrag, meldinger og betalinger opp.
        </TomTilstand>
      ) : (
        <div className="flex flex-col gap-8">
          <Liste tittel="Nye" varsler={nye} onApne={apne} />
          <Liste tittel="Tidligere" varsler={tidligere} onApne={apne} />
        </div>
      )}
    </div>
  )
}

function Liste({ tittel, varsler, onApne }: { tittel: string; varsler: Varsel[]; onApne: (v: Varsel) => void }) {
  if (!varsler.length) return null
  return (
    <section aria-labelledby={`varsler-${tittel}`}>
      <h2 id={`varsler-${tittel}`} className="mb-3 text-lg font-bold text-navy">
        {tittel}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {varsler.map((v) => {
          return (
            <li
              key={v.id}
              className={`animer-inn flex gap-3.5 rounded-2xl p-4 ring-1 ${v.lest ? 'bg-white/60 ring-line' : 'bg-white shadow-kort ring-line'}`}
            >
              <VarselIkon type={v.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`${v.lest ? 'font-medium text-ink-2' : 'font-semibold text-ink'}`}>
                    {!v.lest && <span className="sr-only">Ulest: </span>}
                    {v.tittel}
                  </p>
                  <time dateTime={v.tid} className="shrink-0 text-xs text-ink-3">
                    {relativTid(v.tid)}
                  </time>
                </div>
                <p className="mt-0.5 text-sm text-ink-3">{v.tekst}</p>
                <Knapp variant={v.lest ? 'sekundar' : 'primar'} storrelse="sm" className="mt-3" onClick={() => onApne(v)}>
                  {v.lenketekst}
                </Knapp>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function VarselIkon({ type }: { type: VarselType }) {
  if (type === 'betaling') return <Segl storrelse={40} />
  const { ikon: Ikon, farge } = IKON[type]
  return (
    <span className={`grid size-10 shrink-0 place-items-center rounded-[var(--radius-ikon)] ${farge}`} aria-hidden>
      <Ikon size={19} strokeWidth={2} />
    </span>
  )
}
