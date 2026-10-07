import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

export function Sidehode({
  tittel,
  undertekst,
  tilbake,
  handlinger,
}: {
  tittel: string
  undertekst?: ReactNode
  tilbake?: { til: string; tekst: string }
  handlinger?: ReactNode
}) {
  return (
    <header className="mb-6 sm:mb-8">
      {tilbake && (
        <Link
          to={tilbake.til}
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg py-1 text-sm font-semibold text-navy-700 hover:text-navy"
        >
          <ArrowLeft size={16} aria-hidden />
          {tilbake.tekst}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight font-extrabold text-navy sm:text-[2.125rem]">{tittel}</h1>
          {undertekst && <div className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-2">{undertekst}</div>}
        </div>
        {handlinger && <div className="flex flex-wrap gap-2">{handlinger}</div>}
      </div>
    </header>
  )
}
