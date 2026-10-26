import { Check, Smartphone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { kr } from '../../lib/format'
import { Knapp } from '../ui/Knapp'

type Steg = 'start' | 'venter' | 'ok'

/** Lager et ordrenummer som ligner Vipps sine. */
const lagRef = () => `AM-${Date.now().toString().slice(-8)}`

/**
 * Simulert Vipps-reservasjon (S2). Ingen ekte betaling: flyten etterligner
 * «Vipps eCom» der beløpet reserveres nå og trekkes når kunden godkjenner jobben.
 */
export function VippsBetaling({
  belop,
  tekst,
  apen,
  onAvbryt,
  onReservert,
}: {
  belop: number
  tekst: string
  apen: boolean
  onAvbryt: () => void
  onReservert: (vippsRef: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [steg, settSteg] = useState<Steg>('start')

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (apen && !d.open) {
      settSteg('start')
      d.showModal()
    }
    if (!apen && d.open) d.close()
  }, [apen])

  useEffect(() => {
    if (steg !== 'ok') return
    const t = window.setTimeout(() => onReservert(lagRef()), 900)
    return () => window.clearTimeout(t)
  }, [steg, onReservert])

  return (
    <dialog
      ref={dialog}
      aria-labelledby="vipps-tittel"
      onCancel={(e) => {
        e.preventDefault()
        if (steg !== 'ok') onAvbryt()
      }}
      className="m-auto w-[min(26rem,calc(100%-2rem))] overflow-hidden rounded-3xl bg-white p-0 text-ink shadow-loft backdrop:bg-navy-950/60"
    >
      <header className="flex items-center justify-between bg-[#ff5b24] px-5 py-4 text-white">
        <p id="vipps-tittel" className="font-display text-xl font-extrabold tracking-tight">
          vipps
        </p>
        {steg !== 'ok' && (
          <button type="button" onClick={onAvbryt} aria-label="Avbryt betaling" className="grid size-9 place-items-center rounded-full hover:bg-white/15">
            <X size={20} aria-hidden />
          </button>
        )}
      </header>

      <div className="flex flex-col items-center px-6 pt-6 pb-5 text-center">
        <p className="text-sm text-ink-3">Altmuligmannen AS</p>
        <p className="tall mt-1 font-display text-4xl font-extrabold text-navy">{kr(belop)}</p>
        <p className="mt-1 text-sm text-ink-2">{tekst}</p>

        {steg === 'start' && (
          <>
            <p className="mt-5 rounded-xl bg-cream px-4 py-3 text-sm text-ink-2">Beløpet reserveres nå og trekkes først når du godkjenner jobben.</p>
            <button
              type="button"
              onClick={() => settSteg('venter')}
              className="mt-5 h-13 w-full rounded-xl bg-[#ff5b24] font-semibold text-white transition-colors hover:bg-[#e84e1a]"
            >
              Betal med Vipps
            </button>
          </>
        )}

        {steg === 'venter' && (
          <div className="mt-5 flex w-full flex-col items-center" role="status">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#fff0ea] text-[#ff5b24]">
              <Smartphone size={28} aria-hidden />
            </span>
            <p className="mt-3 font-semibold">Godkjenn i Vipps-appen</p>
            <Knapp variant="primar" bred className="mt-5" onClick={() => settSteg('ok')}>
              Godkjenn (demo)
            </Knapp>
          </div>
        )}

        {steg === 'ok' && (
          <div className="animer-inn mt-5 flex flex-col items-center" role="status">
            <span className="grid size-14 place-items-center rounded-full bg-ok text-white">
              <Check size={30} strokeWidth={3} aria-hidden />
            </span>
            <p className="mt-3 font-semibold">Reservert</p>
          </div>
        )}
      </div>
      <p className="border-t border-line py-2.5 text-center text-xs text-ink-3">Demo · ingen ekte betaling</p>
    </dialog>
  )
}
