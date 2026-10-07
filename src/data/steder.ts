import type { Sted } from '../types'

/**
 * Omtrentlige sentrumspunkter for tettsteder i Østfold.
 * Brukes kun til avstandsberegning og plassering på illustrasjonskartet.
 */
export const STEDER: Sted[] = [
  { by: 'Fredrikstad', omrade: 'Gressvik', lat: 59.2205, lng: 10.8946 },
  { by: 'Fredrikstad', omrade: 'Sentrum', lat: 59.2181, lng: 10.9298 },
  { by: 'Fredrikstad', omrade: 'Kråkerøy', lat: 59.1985, lng: 10.9585 },
  { by: 'Sarpsborg', omrade: 'Sentrum', lat: 59.2839, lng: 11.1096 },
  { by: 'Sarpsborg', omrade: 'Greåker', lat: 59.2700, lng: 11.0350 },
  { by: 'Halden', omrade: 'Sentrum', lat: 59.1229, lng: 11.3875 },
  { by: 'Moss', omrade: 'Sentrum', lat: 59.4340, lng: 10.6577 },
  { by: 'Moss', omrade: 'Rygge', lat: 59.3800, lng: 10.7180 },
  { by: 'Råde', omrade: 'Sentrum', lat: 59.3480, lng: 10.8670 },
  { by: 'Indre Østfold', omrade: 'Askim', lat: 59.5833, lng: 11.1625 },
  { by: 'Indre Østfold', omrade: 'Mysen', lat: 59.5700, lng: 11.3260 },
  { by: 'Hvaler', omrade: 'Skjærhalden', lat: 59.0290, lng: 11.0360 },
]

export function stedNavn(sted: Sted): string {
  return sted.omrade === 'Sentrum' ? sted.by : `${sted.omrade}, ${sted.by}`
}
