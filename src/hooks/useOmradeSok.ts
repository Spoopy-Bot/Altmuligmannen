import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { Omrade, Punkt } from '../components/domain/MockKart'
import { avstandKm } from '../lib/geo'

const STANDARD_RADIUS = 10

function lesPunkt(verdi: string | null): Punkt | undefined {
  if (!verdi) return undefined
  const [lat, lng] = verdi.split(',').map(Number)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined
}

/**
 * Søkeområde (sirkel) lagret i URL-en som `sentrum` og `avstand`.
 * Uten valgt punkt er sentrum `hjem`. Radius 0 betyr ingen avgrensning.
 */
export function useOmradeSok(hjem: Punkt) {
  const [sok, settSok] = useSearchParams()
  const raa = sok.get('sentrum')
  const valgtPunkt = useMemo(() => lesPunkt(raa), [raa])
  const sentrum = valgtPunkt ?? hjem
  const radiusKm = Number(sok.get('avstand')) || 0

  function oppdater(endringer: Record<string, string>) {
    settSok(
      (forrige) => {
        const neste = new URLSearchParams(forrige)
        for (const [nokkel, verdi] of Object.entries(endringer)) {
          if (verdi) neste.set(nokkel, verdi)
          else neste.delete(nokkel)
        }
        return neste
      },
      { replace: true },
    )
  }

  return {
    sentrum,
    radiusKm,
    flyttet: Boolean(valgtPunkt),
    omrade: radiusKm ? ({ ...sentrum, radiusKm } satisfies Omrade) : undefined,
    innenfor: (p: Punkt) => !radiusKm || avstandKm(p, sentrum) <= radiusKm,
    settRadius: (km: number) => oppdater(km ? { avstand: String(km) } : { avstand: '', sentrum: '' }),
    flytt: (p: Punkt) =>
      oppdater({ sentrum: `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`, avstand: String(radiusKm || STANDARD_RADIUS) }),
    tilbake: () => oppdater({ sentrum: '' }),
  }
}

export type OmradeSok = ReturnType<typeof useOmradeSok>
