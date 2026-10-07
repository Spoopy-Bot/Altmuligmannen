import { useState } from 'react'
import { fornavn } from '../../lib/format'
import { useDemo } from '../../store/context'
import { TekstOmrade } from '../ui/Felt'
import { Knapp } from '../ui/Knapp'
import { StjerneVelger } from '../ui/Stjerner'

export function VurderingSkjema({ oppdragId, til, tilNavn }: { oppdragId: string; til: string; tilNavn: string }) {
  const { dispatch, megId } = useDemo()
  const [stjerner, settStjerner] = useState(0)
  const [kommentar, settKommentar] = useState('')
  const [feil, settFeil] = useState<string>()
  const [sender, settSender] = useState(false)

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!stjerner) {
          settFeil('Velg antall stjerner.')
          return
        }
        settSender(true)
        window.setTimeout(() => {
          dispatch({ type: 'gi-rating', oppdragId, fra: megId, til, stjerner, kommentar: kommentar.trim() })
        }, 500)
      }}
    >
      <p className="font-display text-lg font-bold text-navy">Vurder {fornavn(tilNavn)}</p>
      <StjerneVelger
        verdi={stjerner}
        onChange={(n) => {
          settStjerner(n)
          settFeil(undefined)
        }}
        feil={feil}
      />
      <TekstOmrade etikett="Kommentar" valgfri value={kommentar} maxLength={400} onChange={(e) => settKommentar(e.target.value)} />
      <Knapp type="submit" laster={sender}>
        Send vurdering
      </Knapp>
    </form>
  )
}
