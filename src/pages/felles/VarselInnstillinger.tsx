import { BellRing } from 'lucide-react'
import { useId } from 'react'
import { Knapp } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { innstillingerFor } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Rolle, VarselType } from '../../types'

const TYPER: { type: VarselType; tekst: string; for: Rolle[] }[] = [
  { type: 'nytt-oppdrag', tekst: 'Nye oppdrag som passer deg', for: ['aktor'] },
  { type: 'forespørsel', tekst: 'Forespørsler', for: ['aktor'] },
  { type: 'tilbud', tekst: 'Svar på forespørsler', for: ['mottaker'] },
  { type: 'melding', tekst: 'Meldinger', for: ['mottaker', 'aktor'] },
  { type: 'betaling', tekst: 'Betaling', for: ['mottaker', 'aktor'] },
  { type: 'oppdatering', tekst: 'Oppdateringer på jobben', for: ['mottaker', 'aktor'] },
  { type: 'vurdering', tekst: 'Vurderinger', for: ['mottaker', 'aktor'] },
]

export function VarselInnstillinger() {
  const { state, dispatch, megId } = useDemo()
  const rolle = state.rolle ?? 'mottaker'
  const inn = innstillingerFor(state, megId)

  return (
    <div className="max-w-2xl">
      <Sidehode tittel="Innstillinger" />
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <Bryter
            tittel="Push-varsler"
            tekst="Vis varsler på skjermen når noe skjer."
            pa={inn.push}
            onEndre={(push) => dispatch({ type: 'sett-varselinnstilling', id: megId, push })}
          />
          <Knapp
            variant="sekundar"
            storrelse="sm"
            className="mt-4"
            ikon={<BellRing size={16} aria-hidden />}
            onClick={() => dispatch({ type: 'test-varsel', til: megId })}
          >
            Send testvarsel
          </Knapp>
        </section>

        <section aria-labelledby="hva-tittel" className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <h2 id="hva-tittel" className="text-lg font-bold text-navy">
            Hva vil du få varsel om?
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {TYPER.filter((t) => t.for.includes(rolle)).map((t) => (
              <li key={t.type} className="py-3">
                <Bryter
                  tittel={t.tekst}
                  pa={!inn.av.includes(t.type)}
                  onEndre={(pa) => dispatch({ type: 'sett-varselinnstilling', id: megId, varselType: t.type, pa })}
                />
              </li>
            ))}
          </ul>
        </section>
        <p className="text-sm text-ink-3">Prototype: innstillingene lagres i nettleseren, og push-varslene er simulert.</p>
      </div>
    </div>
  )
}

function Bryter({ tittel, tekst, pa, onEndre }: { tittel: string; tekst?: string; pa: boolean; onEndre: (pa: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="font-semibold text-ink">
          {tittel}
        </label>
        {tekst && <p className="text-sm text-ink-3">{tekst}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={pa}
        onClick={() => onEndre(!pa)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200 ${pa ? 'bg-navy' : 'bg-line-strong'}`}
      >
        <span
          className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow-kort transition-transform duration-200 ${pa ? 'translate-x-6' : ''}`}
          aria-hidden
        />
      </button>
    </div>
  )
}
