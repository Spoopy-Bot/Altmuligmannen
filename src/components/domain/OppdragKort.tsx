import { ChevronRight, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { stedNavn } from '../../data/steder'
import { relativTid } from '../../lib/format'
import { HASTEGRAD_TEKST } from '../../lib/utvalg'
import type { Oppdrag } from '../../types'
import { Merke } from '../ui/Merke'
import { EscrowMerke } from './EscrowSegl'
import { KategoriIkon } from './KategoriIkon'
import { StatusMerke } from './StatusMerke'

export function OppdragKort({
  oppdrag,
  perspektiv,
  ekstra,
  handling,
}: {
  oppdrag: Oppdrag
  perspektiv?: 'aktor'
  ekstra?: ReactNode
  handling?: string
}) {
  return (
    <article className="group relative rounded-2xl bg-white p-4 shadow-kort ring-1 ring-line transition-shadow hover:shadow-loft has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-navy-600 sm:p-5">
      <div className="flex gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-ikon)] bg-navy-50 text-navy">
          <KategoriIkon kategori={oppdrag.kategori} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {!(perspektiv === 'aktor' && oppdrag.status === 'apen') && <StatusMerke status={oppdrag.status} perspektiv={perspektiv} />}
            {oppdrag.hastegrad === 'snarest' && oppdrag.status !== 'godkjent' && <Merke tone="feil">{HASTEGRAD_TEKST.snarest}</Merke>}
          </div>
          <h3 className="mt-1.5 font-display text-lg leading-snug font-bold text-navy">
            <Link to={`/oppdrag/${oppdrag.id}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              {oppdrag.tittel}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-3">
            <MapPin size={14} aria-hidden />
            {stedNavn(oppdrag.sted)} · {relativTid(oppdrag.opprettet)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <EscrowMerke betaling={oppdrag.betaling} />
            {ekstra}
          </div>
        </div>
        <ChevronRight size={20} className="mt-3 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      {handling && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-ink ring-1 ring-amber/40">{handling}</p>
      )}
    </article>
  )
}
