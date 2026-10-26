import { Hammer } from 'lucide-react'
import { useState } from 'react'
import type { Levering } from '../../types'
import { TekstFelt, TekstOmrade } from '../ui/Felt'
import { Knapp } from '../ui/Knapp'
import { BildeOpplasting } from './BildeOpplasting'

/** Aktøren rapporterer hva som ble gjort før jobben meldes ferdig. Havner i kontrakt-PDF-en. */
export function LeveringSkjema({ laster, onLever }: { laster: boolean; onLever: (l: Levering) => void }) {
  const [utfort, settUtfort] = useState('')
  const [timer, settTimer] = useState('')
  const [bilder, settBilder] = useState<string[]>([])
  const [feil, settFeil] = useState<{ utfort?: string; timer?: string; bilder?: string }>({})

  function send() {
    const t = Number(timer.replace(',', '.'))
    const f: typeof feil = {}
    if (utfort.trim().length < 10) f.utfort = 'Beskriv kort hva du gjorde.'
    if (!timer || Number.isNaN(t) || t <= 0 || t > 200) f.timer = 'Skriv antall timer, for eksempel 2,5.'
    settFeil(f)
    if (f.utfort || f.timer) return
    onLever({ utfort: utfort.trim(), timer: Math.round(t * 2) / 2, bilder })
  }

  return (
    <div className="flex flex-col gap-4">
      <TekstOmrade
        etikett="Hva ble gjort"
        rows={3}
        value={utfort}
        onChange={(e) => {
          settUtfort(e.target.value)
          settFeil((f) => ({ ...f, utfort: undefined }))
        }}
        feil={feil.utfort}
      />
      <TekstFelt
        etikett="Timer brukt"
        inputMode="decimal"
        value={timer}
        onChange={(e) => {
          settTimer(e.target.value)
          settFeil((f) => ({ ...f, timer: undefined }))
        }}
        feil={feil.timer}
        className="max-w-32"
      />
      <BildeOpplasting
        etikett="Bilde etter"
        maks={1}
        bilder={bilder}
        onEndre={settBilder}
        feil={feil.bilder}
        settFeil={(m) => settFeil((f) => ({ ...f, bilder: m }))}
      />
      <Knapp variant="aksent" bred laster={laster} ikon={<Hammer size={18} aria-hidden />} onClick={send}>
        Meld jobben ferdig
      </Knapp>
    </div>
  )
}
