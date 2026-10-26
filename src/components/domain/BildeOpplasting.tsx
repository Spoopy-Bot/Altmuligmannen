import { ImagePlus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { lagMiniatyr } from '../../lib/bilde'

/** Velg bilder fra kamera eller filer. Bildene skaleres ned så de får plass i localStorage. */
export function BildeOpplasting({
  etikett = 'Bilder',
  maks = 3,
  bilder,
  onEndre,
  feil,
  settFeil,
}: {
  etikett?: string
  maks?: number
  bilder: string[]
  onEndre: (b: string[]) => void
  feil?: string
  settFeil: (m?: string) => void
}) {
  const [laster, settLaster] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function velg(filer: FileList | null) {
    if (!filer?.length) return
    const plass = maks - bilder.length
    if (plass <= 0) {
      settFeil(`Maks ${maks} bilder.`)
      return
    }
    settLaster(true)
    settFeil(undefined)
    try {
      const nye = await Promise.all(Array.from(filer).slice(0, plass).map((f) => lagMiniatyr(f)))
      onEndre([...bilder, ...nye])
      if (filer.length > plass) settFeil(`Maks ${maks} bilder.`)
    } catch (e) {
      settFeil(e instanceof Error ? `${e.message}.` : 'Bildet kunne ikke leses.')
    } finally {
      settLaster(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        {etikett} <span className="font-normal text-ink-3">(valgfritt, maks {maks})</span>
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        {bilder.map((b, i) => (
          <div key={i} className="relative">
            <img src={b} alt={`Vedlagt bilde ${i + 1}`} className="size-24 rounded-xl object-cover ring-1 ring-line" />
            <button
              type="button"
              onClick={() => onEndre(bilder.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-navy text-white shadow-kort hover:bg-navy-700"
              aria-label={`Fjern bilde ${i + 1}`}
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ))}
        {bilder.length < maks && (
          <label className="grid size-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line-strong bg-white text-navy transition-colors hover:border-navy-600 hover:bg-navy-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy-600">
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple={maks > 1}
              className="sr-only"
              onChange={(e) => velg(e.target.files)}
              aria-describedby={feil ? 'bilde-feil' : undefined}
            />
            <span className="flex flex-col items-center gap-1 text-xs font-semibold">
              {laster ? (
                <span className="size-5 animate-spin rounded-full border-2 border-navy border-r-transparent" aria-hidden />
              ) : (
                <ImagePlus size={22} aria-hidden />
              )}
              {laster ? 'Laster …' : 'Legg til bilde'}
            </span>
          </label>
        )}
      </div>
      {feil && (
        <p id="bilde-feil" role="alert" className="mt-2 text-sm font-medium text-feil">
          {feil}
        </p>
      )}
    </div>
  )
}
