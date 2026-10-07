import { Star } from 'lucide-react'
import { useId } from 'react'
import { desimal } from '../../lib/format'

export function Stjerner({ verdi, storrelse = 16 }: { verdi: number; storrelse?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${desimal(verdi)} av 5 stjerner`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={storrelse}
          strokeWidth={1.75}
          className={n <= Math.round(verdi) ? 'fill-navy text-navy' : 'fill-cream-300 text-line-strong'}
          aria-hidden
        />
      ))}
    </span>
  )
}

export function RatingLinje({ snitt, antall }: { snitt: number; antall: number }) {
  if (antall === 0) return <span className="text-sm text-ink-3">Ingen vurderinger ennå</span>
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Star size={15} className="fill-current" aria-hidden />
      <span className="tall font-semibold text-ink">{desimal(snitt)}</span>
      <span className="text-ink-3">({antall})</span>
    </span>
  )
}

const ETIKETTER = ['Svært misfornøyd', 'Misfornøyd', 'Greit', 'Fornøyd', 'Svært fornøyd']

export function StjerneVelger({
  verdi,
  onChange,
  feil,
}: {
  verdi: number
  onChange: (n: number) => void
  feil?: string
}) {
  const navn = useId()
  return (
    <fieldset aria-describedby={feil ? `${navn}-feil` : undefined}>
      <legend className="mb-2 text-sm font-semibold text-ink">Antall stjerner</legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="group cursor-pointer rounded-lg p-1 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy">
            <input
              type="radio"
              name={navn}
              value={n}
              checked={verdi === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <Star
              size={32}
              strokeWidth={1.5}
              className={`transition-transform duration-150 group-hover:scale-110 ${n <= verdi ? 'fill-navy text-navy' : 'fill-white text-line-strong'}`}
              aria-hidden
            />
            <span className="sr-only">
              {n} {n === 1 ? 'stjerne' : 'stjerner'} – {ETIKETTER[n - 1]}
            </span>
          </label>
        ))}
        <span className="ml-2 text-sm text-ink-2" aria-live="polite">
          {verdi > 0 ? ETIKETTER[verdi - 1] : ''}
        </span>
      </div>
      {feil && (
        <p id={`${navn}-feil`} className="mt-1.5 text-sm font-medium text-feil">
          {feil}
        </p>
      )}
    </fieldset>
  )
}
