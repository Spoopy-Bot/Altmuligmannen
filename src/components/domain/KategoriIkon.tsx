import { Brush, Droplets, Hammer, Leaf, Package, Sparkles, Wrench, type LucideProps } from 'lucide-react'
import type { KategoriId } from '../../types'

const IKONER = {
  ror: Droplets,
  maling: Brush,
  montering: Wrench,
  hage: Leaf,
  reparasjon: Hammer,
  flytting: Package,
  vask: Sparkles,
} satisfies Record<KategoriId, unknown>

export function KategoriIkon({ kategori, ...rest }: { kategori: KategoriId } & LucideProps) {
  const Ikon = IKONER[kategori]
  return <Ikon aria-hidden strokeWidth={1.75} {...rest} />
}
