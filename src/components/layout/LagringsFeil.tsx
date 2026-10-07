import { RotateCcw } from 'lucide-react'
import ikon from '../../assets/ikon-160.png'
import { Knapp } from '../ui/Knapp'

export function LagringsFeil({ onNullstill }: { onNullstill: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-4">
      <div role="alert" className="max-w-md rounded-2xl bg-white p-8 text-center shadow-kort">
        <img src={ikon} alt="" className="mx-auto mb-5 size-16" />
        <h1 className="text-2xl font-extrabold text-navy">Demo-dataene kunne ikke leses</h1>
        <p className="mt-2 text-ink-2">Nullstill for å starte på nytt.</p>
        <Knapp className="mt-6" onClick={onNullstill} ikon={<RotateCcw size={18} aria-hidden />}>
          Nullstill demo
        </Knapp>
      </div>
    </main>
  )
}
