import { Compass } from 'lucide-react'
import { KnappLenke } from '../../components/ui/Knapp'
import { TomTilstand } from '../../components/ui/TomTilstand'

export function IkkeFunnet({ hva = 'Siden' }: { hva?: string }) {
  return (
    <TomTilstand
      ikon={<Compass size={24} aria-hidden />}
      tittel={`${hva} finnes ikke`}
      handling={<KnappLenke to="/">Til forsiden</KnappLenke>}
    >
      Lenken er feil, eller demoen er nullstilt.
    </TomTilstand>
  )
}
