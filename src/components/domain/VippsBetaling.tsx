import { Check, ChevronRight, Lock, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { kr } from '../../lib/format'

type Steg = 'telefon' | 'venter' | 'app' | 'ok'

const ORANSJE = 'bg-[#ff5b24]'
const TUMME = 56

/** Lager et ordrenummer som ligner Vipps sine. */
const lagRef = () => `AM-${Date.now().toString().slice(-8)}`

/** Formaterer norsk mobilnummer som «123 45 678». */
const formaterTelefon = (v: string) => {
  const s = v.replace(/\D/g, '').slice(0, 8)
  return [s.slice(0, 3), s.slice(3, 5), s.slice(5)].filter(Boolean).join(' ')
}

/**
 * Simulert Vipps-reservasjon (S2). Ingen ekte betaling: flyten etterligner
 * «Vipps eCom» (mobilnummer, push til appen, sveip for å betale) der beløpet
 * reserveres nå og trekkes når kunden godkjenner jobben.
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
  const [steg, settSteg] = useState<Steg>('telefon')
  const [telefon, settTelefon] = useState('123 45 678')

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (apen && !d.open) {
      settSteg('telefon')
      d.showModal()
    }
    if (!apen && d.open) d.close()
  }, [apen])

  useEffect(() => {
    if (steg !== 'venter') return
    const t = window.setTimeout(() => settSteg('app'), 1800)
    return () => window.clearTimeout(t)
  }, [steg])

  useEffect(() => {
    if (steg !== 'ok') return
    const t = window.setTimeout(() => onReservert(lagRef()), 1100)
    return () => window.clearTimeout(t)
  }, [steg, onReservert])

  const gyldig = telefon.replace(/\D/g, '').length === 8

  return (
    <dialog
      ref={dialog}
      aria-labelledby="vipps-tittel"
      onCancel={(e) => {
        e.preventDefault()
        if (steg !== 'ok') onAvbryt()
      }}
      className={`m-auto w-[min(24rem,calc(100%-2rem))] overflow-hidden rounded-3xl p-0 text-ink shadow-loft backdrop:bg-navy-950/60 ${ORANSJE}`}
    >
      <header className="flex items-center justify-between px-5 pt-4 pb-3 text-white">
        <p id="vipps-tittel" className="font-display text-2xl font-extrabold tracking-tight lowercase">
          vipps<span aria-hidden>.</span>
        </p>
        {steg !== 'ok' && (
          <button type="button" onClick={onAvbryt} aria-label="Avbryt betaling" className="grid size-9 place-items-center rounded-full hover:bg-white/15">
            <X size={20} aria-hidden />
          </button>
        )}
      </header>

      <div className="mx-3 mb-3 rounded-2xl bg-white px-5 pt-5 pb-5">
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div className="min-w-0">
            <p className="text-xs text-ink-3">Betaling til</p>
            <p className="font-semibold">Altmuligmannen AS</p>
            <p className="mt-0.5 truncate text-sm text-ink-2">{tekst}</p>
          </div>
          <p className="tall shrink-0 font-display text-2xl font-extrabold text-navy">{kr(belop)}</p>
        </div>

        {steg === 'telefon' && (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (gyldig) settSteg('venter')
            }}
          >
            <label htmlFor="vipps-tlf" className="text-sm font-semibold">
              Mobilnummer
            </label>
            <div className="mt-1.5 flex h-13 items-center rounded-xl border border-line-strong bg-white focus-within:border-[#ff5b24] focus-within:ring-2 focus-within:ring-[#ff5b24]/30">
              <span className="border-r border-line px-3 text-ink-2">+47</span>
              <input
                id="vipps-tlf"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={telefon}
                onChange={(e) => settTelefon(formaterTelefon(e.target.value))}
                className="tall h-full min-w-0 flex-1 bg-transparent px-3 text-lg outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!gyldig}
              className={`mt-4 h-13 w-full rounded-full ${ORANSJE} font-semibold text-white transition-colors hover:bg-[#e84e1a] disabled:opacity-40`}
            >
              Fortsett
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-3">
              <Lock size={12} aria-hidden /> Beløpet reserveres, og trekkes når du godkjenner jobben
            </p>
          </form>
        )}

        {steg === 'venter' && (
          <div className="flex flex-col items-center py-8 text-center" role="status">
            <span className="size-12 animate-spin rounded-full border-4 border-[#ffd9cb] border-t-[#ff5b24]" aria-hidden />
            <p className="mt-4 font-semibold">Åpne Vipps-appen</p>
            <p className="mt-1 text-sm text-ink-2">Vi har sendt en forespørsel til +47 {telefon}</p>
          </div>
        )}

        {steg === 'app' && (
          <div className="animer-inn mt-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">Betal med</dt>
                <dd className="font-medium">Visa •••• 4242</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">Type</dt>
                <dd className="font-medium">Reservasjon</dd>
              </div>
            </dl>
            <SveipForBetaling belop={belop} onFerdig={() => settSteg('ok')} />
          </div>
        )}

        {steg === 'ok' && (
          <div className="animer-inn flex flex-col items-center py-6 text-center" role="status">
            <span className="grid size-14 place-items-center rounded-full bg-ok text-white">
              <Check size={30} strokeWidth={3} aria-hidden />
            </span>
            <p className="mt-3 font-semibold">Betalingen er reservert</p>
            <p className="tall mt-1 text-sm text-ink-2">{kr(belop)} til Altmuligmannen AS</p>
          </div>
        )}
      </div>
      <p className="pb-3 text-center text-xs text-white/90">Demo · ingen ekte betaling</p>
    </dialog>
  )
}

/** Sveip-for-å-betale. Tastatur: Enter eller mellomrom fullfører. */
function SveipForBetaling({ belop, onFerdig }: { belop: number; onFerdig: () => void }) {
  const spor = useRef<HTMLDivElement>(null)
  const start = useRef<number | null>(null)
  const [x, settX] = useState(0)
  const [drar, settDrar] = useState(false)

  const maks = () => (spor.current?.clientWidth ?? 0) - TUMME - 8

  const flytt = (e: PointerEvent<HTMLButtonElement>) => {
    if (start.current === null) return
    settX(Math.max(0, Math.min(maks(), e.clientX - start.current)))
  }

  const slipp = () => {
    if (start.current === null) return
    start.current = null
    settDrar(false)
    if (x >= maks() * 0.85) {
      settX(maks())
      onFerdig()
    } else {
      settX(0)
    }
  }

  const taster = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      settX(maks())
      onFerdig()
    }
  }

  return (
    <div ref={spor} className="relative mt-5 h-16 select-none overflow-hidden rounded-full bg-[#ffe6dc]">
      <span
        className="pointer-events-none absolute inset-0 grid place-items-center pl-12 text-sm font-semibold text-[#c2410c]"
        style={{ opacity: Math.max(0, 1 - x / 120) }}
      >
        Sveip for å betale {kr(belop)}
      </span>
      <button
        type="button"
        aria-label={`Betal ${kr(belop)}. Sveip, eller trykk Enter`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          start.current = e.clientX - x
          settDrar(true)
        }}
        onPointerMove={flytt}
        onPointerUp={slipp}
        onPointerCancel={slipp}
        onKeyDown={taster}
        style={{ transform: `translateX(${x}px)`, transition: drar ? 'none' : 'transform 200ms var(--ease-ut)' }}
        className={`absolute top-1 left-1 grid size-14 touch-none place-items-center rounded-full ${ORANSJE} text-white shadow-md`}
      >
        <ChevronRight size={26} aria-hidden />
      </button>
    </div>
  )
}
