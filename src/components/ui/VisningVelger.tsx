import { List, Map as KartIkon } from 'lucide-react'

export type Visning = 'liste' | 'kart'

export function VisningVelger({ visning, onVelg }: { visning: Visning; onVelg: (v: Visning) => void }) {
  return (
    <div role="group" aria-label="Visning" className="flex rounded-xl bg-white p-1 ring-1 ring-line">
      {(['liste', 'kart'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={visning === v}
          onClick={() => onVelg(v)}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${
            visning === v ? 'bg-navy text-white' : 'text-ink-2 hover:text-navy'
          }`}
        >
          {v === 'kart' ? <KartIkon size={16} aria-hidden /> : <List size={16} aria-hidden />}
          {v === 'kart' ? 'Kart' : 'Liste'}
        </button>
      ))}
    </div>
  )
}
