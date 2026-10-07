import { useId } from 'react'
import type { BetalingStatus } from '../../types'

/**
 * Altmuligmannens betalingssegl: app-ikonets avrundede kvadrat med billett-hakk på sidene.
 * Formen brukes bare for pengestatus. Ravgul med nøkkelhull = reservert, navy med hake = frigitt.
 */
export function Segl({ status = 'reservert', storrelse = 48, className = '' }: { status?: BetalingStatus; storrelse?: number; className?: string }) {
  const maske = useId()
  const frigitt = status === 'frigitt'
  return (
    <svg width={storrelse} height={storrelse} viewBox="0 0 48 48" className={`shrink-0 ${className}`} aria-hidden>
      <defs>
        <mask id={maske}>
          <rect width="48" height="48" rx="13.5" fill="white" />
          <circle cx="0" cy="24" r="5" fill="black" />
          <circle cx="48" cy="24" r="5" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#${maske})`}>
        <rect width="48" height="48" rx="13.5" fill={frigitt ? '#17334c' : '#fdaf1c'} />
        <path d="M9 24h2.5M36.5 24H39" stroke={frigitt ? '#fdaf1c' : '#0c1c2b'} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {frigitt ? (
        <path d="M15.5 24.5l5.5 5.5 11.5-12.5" fill="none" stroke="#fdaf1c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M24 13.5a5.8 5.8 0 0 1 3.1 10.7l1.6 9.3h-9.4l1.6-9.3A5.8 5.8 0 0 1 24 13.5z" fill="#0c1c2b" />
      )}
    </svg>
  )
}
