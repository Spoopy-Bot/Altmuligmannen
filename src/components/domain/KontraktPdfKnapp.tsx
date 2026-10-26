import { FileDown } from 'lucide-react'
import { useState } from 'react'
import { lastNedKontraktPdf } from '../../lib/kontraktPdf'
import { useDemo } from '../../store/context'
import type { Kontrakt } from '../../types'
import { Knapp } from '../ui/Knapp'

export function KontraktPdfKnapp({ kontrakt, variant = 'sekundar' }: { kontrakt: Kontrakt; variant?: 'sekundar' | 'tekst' }) {
  const { state } = useDemo()
  const [laster, settLaster] = useState(false)
  const [feil, settFeil] = useState(false)

  async function lastNed() {
    settLaster(true)
    settFeil(false)
    try {
      await lastNedKontraktPdf(state, kontrakt)
    } catch {
      settFeil(true)
    } finally {
      settLaster(false)
    }
  }

  return (
    <>
      <Knapp variant={variant} bred laster={laster} ikon={<FileDown size={18} aria-hidden />} onClick={lastNed}>
        Last ned PDF
      </Knapp>
      {feil && (
        <p role="alert" className="text-sm font-medium text-feil">
          PDF-en kunne ikke lages. Prøv igjen.
        </p>
      )}
    </>
  )
}
