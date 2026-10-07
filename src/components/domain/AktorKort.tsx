import { BadgeCheck, Clock, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { kategori } from '../../data/kategorier'
import { stedNavn } from '../../data/steder'
import { km, kr } from '../../lib/format'
import type { Aktor } from '../../types'
import { Avatar } from '../ui/Avatar'
import { RatingLinje } from '../ui/Stjerner'

export function AktorKort({
  aktor,
  avstand,
  rating,
  valgt,
  lenke,
  kompakt,
  children,
}: {
  aktor: Aktor
  avstand?: number
  rating: { snitt: number; antall: number }
  valgt?: boolean
  lenke: string
  kompakt?: boolean
  children?: ReactNode
}) {
  return (
    <article
      className={`relative rounded-2xl bg-white p-4 shadow-kort ring-1 transition-[box-shadow] hover:shadow-loft has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-navy-600 sm:p-5 ${valgt ? 'ring-2 ring-navy' : 'ring-line'}`}
    >
      <div className="flex gap-4">
        <Avatar navn={aktor.navn} farge={aktor.farge} storrelse="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="font-display text-lg leading-tight font-bold text-navy">
              <Link to={lenke} className="after:absolute after:inset-0 after:rounded-2xl hover:underline focus-visible:outline-none">
                {aktor.navn}
              </Link>
            </h3>
            <p className="tall text-sm font-semibold text-ink">{kr(aktor.timepris)}/t</p>
          </div>
          <p className="text-sm text-ink-2">
            {aktor.tittel}
            {aktor.firma && ` · ${aktor.firma}`}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
            <RatingLinje snitt={rating.snitt} antall={rating.antall} />
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} className="text-ink-3" aria-hidden />
              {stedNavn(aktor.sted)}
              {avstand !== undefined && <span className="tall text-ink-3">· {km(avstand)}</span>}
            </span>
            {aktor.ledigDenneUken && !kompakt && (
              <span className="inline-flex items-center gap-1 text-ok">
                <Clock size={15} aria-hidden /> Ledig denne uken
              </span>
            )}
          </div>
          {!kompakt && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Kategorier">
            {aktor.kategorier.map((k) => (
              <li key={k} className="rounded-md bg-cream-200 px-2 py-0.5 text-xs font-medium text-ink-2">
                {kategori(k).navn}
              </li>
            ))}
            {aktor.verifisert.fagbrev && (
              <li className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy">
                <BadgeCheck size={13} aria-hidden /> Fagbrev
              </li>
            )}
          </ul>
          )}
        </div>
      </div>
      {children && <div className="relative z-10 mt-4">{children}</div>}
    </article>
  )
}
