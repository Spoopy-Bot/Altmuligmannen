import type { ReactNode } from 'react'

export type Tone = 'navy' | 'amber' | 'ok' | 'feil' | 'noytral' | 'lys'

const toner: Record<Tone, string> = {
  navy: 'bg-navy text-cream',
  amber: 'bg-amber-100 text-amber-ink ring-1 ring-inset ring-amber/60',
  ok: 'bg-ok-50 text-ok ring-1 ring-inset ring-ok/25',
  feil: 'bg-feil-50 text-feil ring-1 ring-inset ring-feil/25',
  noytral: 'bg-cream-200 text-ink-2 ring-1 ring-inset ring-line',
  lys: 'bg-navy-50 text-navy ring-1 ring-inset ring-navy-100',
}

export function Merke({ tone = 'noytral', ikon, children }: { tone?: Tone; ikon?: ReactNode; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${toner[tone]}`}>
      {ikon}
      {children}
    </span>
  )
}
