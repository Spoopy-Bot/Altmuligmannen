import { STATUS_TEKST } from '../../lib/utvalg'
import type { OppdragStatus } from '../../types'
import { Merke, type Tone } from '../ui/Merke'

const TONE: Record<OppdragStatus, Tone> = {
  apen: 'noytral',
  forespurt: 'lys',
  akseptert: 'lys',
  pagar: 'navy',
  levert: 'amber',
  godkjent: 'ok',
}

export function StatusMerke({ status, perspektiv }: { status: OppdragStatus; perspektiv?: 'aktor' }) {
  const tekst =
    perspektiv === 'aktor' && status === 'forespurt'
      ? 'Venter på ditt svar'
      : perspektiv === 'aktor' && status === 'apen'
        ? 'Åpent oppdrag'
        : STATUS_TEKST[status]
  return <Merke tone={TONE[status]}>{tekst}</Merke>
}
