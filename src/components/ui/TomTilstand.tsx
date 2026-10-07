import type { ReactNode } from 'react'

export function TomTilstand({
  ikon,
  tittel,
  children,
  handling,
}: {
  ikon: ReactNode
  tittel: string
  children: ReactNode
  handling?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 py-10 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-[var(--radius-ikon)] bg-navy-50 text-navy" aria-hidden>
        {ikon}
      </span>
      <h2 className="text-lg font-bold text-navy">{tittel}</h2>
      <div className="mt-1.5 max-w-sm text-[0.9375rem] text-ink-2">{children}</div>
      {handling && <div className="mt-5">{handling}</div>}
    </div>
  )
}

export function FeilMelding({ tittel, children, handling }: { tittel: string; children: ReactNode; handling?: ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-feil/25 bg-feil-50 px-5 py-4">
      <p className="font-semibold text-feil">{tittel}</p>
      <div className="mt-1 text-sm text-ink-2">{children}</div>
      {handling && <div className="mt-3">{handling}</div>}
    </div>
  )
}
