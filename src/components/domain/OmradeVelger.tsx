import { House } from 'lucide-react'
import { useId } from 'react'
import type { OmradeSok } from '../../hooks/useOmradeSok'
import { Knapp } from '../ui/Knapp'

/** Glidebryter for søkesirkelen over kartet. */
export function OmradeVelger({ sok, hjemTekst = 'Hjem' }: { sok: OmradeSok; hjemTekst?: string }) {
  const id = useId()
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        Område
      </label>
      <input
        id={id}
        type="range"
        min={1}
        max={50}
        value={sok.radiusKm || 10}
        onChange={(e) => sok.settRadius(Number(e.target.value))}
        className="min-w-32 flex-1 accent-navy"
      />
      <span className="tall w-14 text-right text-sm font-semibold text-navy">{sok.radiusKm ? `${sok.radiusKm} km` : 'Av'}</span>
      {sok.radiusKm > 0 && (
        <Knapp variant="tekst" storrelse="sm" onClick={() => sok.settRadius(0)}>
          Fjern
        </Knapp>
      )}
      {sok.flyttet && (
        <Knapp variant="tekst" storrelse="sm" ikon={<House size={15} aria-hidden />} onClick={sok.tilbake}>
          {hjemTekst}
        </Knapp>
      )}
      <p className="w-full text-xs text-ink-3">Trykk i kartet for å flytte området.</p>
    </div>
  )
}
