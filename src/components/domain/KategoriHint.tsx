import { Info } from 'lucide-react'
import type { KategoriId } from '../../types'

export function KategoriHint({ id, className = '' }: { id: KategoriId; className?: string }) {
  if (id !== 'ror' && id !== 'el') return null
  return (
    <div className={`${className} flex gap-3 rounded-2xl bg-navy-50 p-4 text-sm text-ink-2`}>
      <Info size={18} className="mt-0.5 shrink-0 text-navy" aria-hidden />
      {id === 'ror' ? (
        <p>
          <strong className="text-ink">Kun enkle jobber på rør du ser</strong>, som å bytte kran eller rense sluk. Skjulte rør og våtrom krever
          autorisert rørlegger, ellers kan husforsikringen ryke. Du får dokumentasjon fra aktøren på jobben.
        </p>
      ) : (
        <p>
          <strong className="text-ink">Kun enkle jobber du selv har lov til</strong>, som å henge opp lamper med støpsel, bytte dekkplater eller
          koble skjøteledninger. Fast installasjon, sikringsskap og varmekabler krever registrert elektroforetak.
        </p>
      )}
    </div>
  )
}
