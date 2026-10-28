import { VurderingListe } from '../../components/domain/VurderingListe'
import { useDemo } from '../../store/context'

export function Vurderinger() {
  const { state } = useDemo()
  return (
    <div className="max-w-2xl">
      <VurderingListe id={state.aktivAktorId} />
    </div>
  )
}
