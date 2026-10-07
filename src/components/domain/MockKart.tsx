import { House } from 'lucide-react'
import { useMemo } from 'react'
import { initialer } from '../../lib/format'
import type { Aktor, Sted } from '../../types'

const B = 400
const H = 548
const LNG0 = 10.55
const LNG1 = 11.55
const LAT0 = 58.98
const LAT1 = 59.68
const PX_PER_KM = B / ((LNG1 - LNG0) * 57)

function xy(lng: number, lat: number): [number, number] {
  return [((lng - LNG0) / (LNG1 - LNG0)) * B, ((LAT1 - lat) / (LAT1 - LAT0)) * H]
}

const sti = (pkt: [number, number][], lukk = true) =>
  pkt.map(([lng, lat], i) => `${i ? 'L' : 'M'}${xy(lng, lat).map((n) => n.toFixed(1)).join(' ')}`).join(' ') + (lukk ? ' Z' : '')

const LAND = sti([
  [10.7, 59.68], [10.67, 59.55], [10.66, 59.47], [10.64, 59.44], [10.69, 59.39], [10.63, 59.33], [10.7, 59.29],
  [10.79, 59.27], [10.86, 59.23], [10.88, 59.18], [10.94, 59.14], [10.99, 59.08], [11.07, 59.09], [11.15, 59.12],
  [11.24, 59.13], [11.32, 59.11], [11.4, 59.09], [11.47, 59.04], [11.55, 59.02], [11.55, 59.68],
])
const OYER = [
  sti([[10.98, 59.06], [11.03, 59.05], [11.04, 59.02], [10.99, 59.01], [10.96, 59.03]]),
  sti([[11.05, 59.04], [11.09, 59.03], [11.08, 59.0], [11.04, 59.0]]),
  sti([[10.66, 59.43], [10.6, 59.42], [10.58, 59.38], [10.62, 59.37], [10.67, 59.4]]),
]
const VANSJO = sti([[10.78, 59.42], [10.86, 59.43], [10.9, 59.4], [10.86, 59.38], [10.8, 59.39]])
const GLOMMA = sti(
  [[11.24, 59.68], [11.22, 59.6], [11.18, 59.5], [11.14, 59.4], [11.12, 59.3], [11.05, 59.27], [10.99, 59.24], [10.94, 59.21]],
  false,
)
const GRENSE = sti([[11.47, 59.04], [11.45, 59.12], [11.52, 59.25], [11.55, 59.3]], false)
const BYER: [string, number, number][] = [
  ['Moss', 10.66, 59.44], ['Fredrikstad', 10.93, 59.21], ['Sarpsborg', 11.11, 59.28], ['Halden', 11.39, 59.12],
  ['Askim', 11.16, 59.58], ['Mysen', 11.33, 59.57], ['Råde', 10.87, 59.35], ['Hvaler', 11.03, 59.03],
]

interface Pin {
  aktor: Aktor
  x: number
  y: number
}

/** Skyver pinner fra hverandre så de ikke overlapper der mange bor tett. */
function sprePinner(aktorer: Aktor[]): Pin[] {
  const pinner = aktorer.map((a) => {
    const [x, y] = xy(a.sted.lng, a.sted.lat)
    return { aktor: a, x, y }
  })
  const min = 34
  for (let runde = 0; runde < 40; runde++) {
    for (let i = 0; i < pinner.length; i++) {
      for (let j = i + 1; j < pinner.length; j++) {
        const a = pinner[i]
        const b = pinner[j]
        const dx = b.x - a.x || 0.5
        const dy = b.y - a.y || 0.5
        const d = Math.hypot(dx, dy)
        if (d < min) {
          const skyv = (min - d) / 2
          a.x -= (dx / d) * skyv
          a.y -= (dy / d) * skyv
          b.x += (dx / d) * skyv
          b.y += (dy / d) * skyv
        }
      }
    }
  }
  return pinner
}

export function MockKart({
  aktorer,
  valgtId,
  onVelg,
  oppdragSted,
}: {
  aktorer: Aktor[]
  valgtId?: string
  onVelg: (id: string) => void
  oppdragSted?: Sted
}) {
  const pinner = useMemo(() => sprePinner(aktorer), [aktorer])
  const valgt = pinner.find((p) => p.aktor.id === valgtId)
  const hjem = oppdragSted ? xy(oppdragSted.lng, oppdragSted.lat) : undefined
  const pct = (x: number, y: number) => ({ left: `${(x / B) * 100}%`, top: `${(y / H) * 100}%` })

  return (
    <figure className="overflow-hidden rounded-2xl bg-[#dfe7ec] ring-1 ring-line">
      <div className="relative mx-auto aspect-[400/548] w-full max-w-[34rem]">
        <svg viewBox={`0 0 ${B} ${H}`} className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <pattern id="kontur" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
              <path d="M0 7 Q3.5 4 7 7 T14 7" fill="none" stroke="#d9cfb2" strokeWidth="0.8" />
            </pattern>
          </defs>
          <path d={LAND} fill="#f1ead6" stroke="#c9bd9b" strokeWidth="1" />
          <path d={LAND} fill="url(#kontur)" opacity="0.6" />
          {OYER.map((d) => (
            <path key={d} d={d} fill="#f1ead6" stroke="#c9bd9b" strokeWidth="1" />
          ))}
          <path d={VANSJO} fill="#dfe7ec" stroke="#b9c8d2" strokeWidth="1" />
          <path d={GLOMMA} fill="none" stroke="#b9c8d2" strokeWidth="3" strokeLinecap="round" />
          <path d={GRENSE} fill="none" stroke="#9a8f74" strokeWidth="1.2" strokeDasharray="6 4" />
          {BYER.map(([navn, lng, lat]) => {
            const [x, y] = xy(lng, lat)
            return (
              <text key={navn} x={x} y={y + 24} textAnchor="middle" stroke="#f1ead6" strokeWidth="3" paintOrder="stroke" className="fill-ink-2 text-[0.6875rem] font-semibold tracking-wide uppercase">
                {navn}
              </text>
            )
          })}
          {valgt && (
            <circle
              cx={valgt.x}
              cy={valgt.y}
              r={valgt.aktor.radiusKm * PX_PER_KM}
              fill="rgb(23 51 76 / 0.06)"
              stroke="#17334c"
              strokeOpacity="0.35"
              strokeDasharray="4 4"
            />
          )}
          {valgt && hjem && (
            <line x1={hjem[0]} y1={hjem[1]} x2={valgt.x} y2={valgt.y} stroke="#17334c" strokeWidth="2.5" strokeDasharray="1 6" strokeLinecap="round" />
          )}
        </svg>

        {hjem && (
          <span
            className="absolute z-20 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[var(--radius-ikon)] bg-amber text-navy-950 shadow-loft ring-2 ring-white"
            style={pct(hjem[0], hjem[1])}
            title="Ditt oppdrag"
          >
            <House size={16} strokeWidth={2.4} aria-hidden />
            <span className="sr-only">Ditt oppdrag</span>
          </span>
        )}

        {pinner.map((p) => {
          const erValgt = p.aktor.id === valgtId
          return (
            <button
              key={p.aktor.id}
              type="button"
              onClick={() => onVelg(p.aktor.id)}
              aria-pressed={erValgt}
              aria-label={`${p.aktor.navn}, ${p.aktor.sted.omrade === 'Sentrum' ? p.aktor.sted.by : p.aktor.sted.omrade}`}
              className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[var(--radius-ikon)] font-display font-bold shadow-kort ring-2 ring-white transition-[transform,background-color] duration-150 hover:scale-110 ${
                erValgt ? 'z-30 size-10 bg-navy text-sm text-amber' : 'z-10 size-8 bg-white text-[0.6875rem] text-navy'
              }`}
              style={pct(p.x, p.y)}
            >
              {initialer(p.aktor.navn)}
            </button>
          )
        })}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-white px-4 py-2.5 text-xs text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-[28%] bg-white ring-1 ring-navy" aria-hidden /> Aktør
        </span>
        {hjem && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-[28%] bg-amber" aria-hidden /> Ditt oppdrag
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-4 border-t border-dashed border-navy" aria-hidden /> Område
        </span>
        <span className="ml-auto">Illustrasjon</span>
      </figcaption>
    </figure>
  )
}
