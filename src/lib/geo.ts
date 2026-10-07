import type { Sted } from '../types'

/** Luftlinje mellom to steder i km (haversine). */
export function avstandKm(a: Pick<Sted, 'lat' | 'lng'>, b: Pick<Sted, 'lat' | 'lng'>): number {
  const R = 6371
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
