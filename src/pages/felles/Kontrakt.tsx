import { Check } from 'lucide-react'
import { useParams } from 'react-router'
import { EscrowSegl } from '../../components/domain/EscrowSegl'
import { Merke } from '../../components/ui/Merke'
import { Sidehode } from '../../components/ui/Sidehode'
import { stedNavn } from '../../data/steder'
import { datoMedAr, klokkeslett, kr } from '../../lib/format'
import { finnAktor, finnMottaker } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import { IkkeFunnet } from './IkkeFunnet'

export function Kontrakt() {
  const { id } = useParams()
  const { state, megId } = useDemo()
  const kontrakt = state.kontrakter.find((k) => k.id === id)
  const oppdrag = state.oppdrag.find((o) => o.id === kontrakt?.oppdragId)
  if (!kontrakt || !oppdrag || (megId !== kontrakt.aktorId && megId !== kontrakt.mottakerId)) return <IkkeFunnet hva="Kontrakten" />

  const aktor = finnAktor(state, kontrakt.aktorId)
  const mottaker = finnMottaker(state, kontrakt.mottakerId)
  const nr = kontrakt.id.replace(/\D/g, '').slice(-4).padStart(4, '0')

  return (
    <div className="max-w-2xl">
      <Sidehode tilbake={{ til: `/oppdrag/${oppdrag.id}`, tekst: 'Til oppdraget' }} tittel="Kontrakt" />

      <article className="rounded-3xl bg-white shadow-kort ring-1 ring-line">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
          <p className="tall text-sm text-ink-3">Nr. {nr}</p>
          <Merke tone={kontrakt.status === 'fullfort' ? 'ok' : 'navy'}>{kontrakt.status === 'fullfort' ? 'Fullført' : 'Aktiv'}</Merke>
        </header>
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-ink-3">Kunde</dt>
              <dd className="font-semibold text-ink">{mottaker?.navn}</dd>
              <dd className="text-sm text-ink-2">
                {oppdrag.adresse}, {stedNavn(oppdrag.sted)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Aktør</dt>
              <dd className="font-semibold text-ink">{aktor?.navn}</dd>
              <dd className="text-sm text-ink-2">{aktor?.firma ?? aktor?.tittel}</dd>
            </div>
          </dl>

          <div>
            <h2 className="text-base font-bold text-navy">{oppdrag.tittel}</h2>
            <p className="mt-1 text-[0.9375rem] text-ink-2">{kontrakt.arbeid}</p>
          </div>

          <div className="flex items-baseline justify-between border-y border-line py-4">
            <span className="font-semibold text-ink">Avtalt pris</span>
            <span className="tall font-display text-2xl font-extrabold text-navy">{kr(kontrakt.pris)}</span>
          </div>

          <EscrowSegl betaling={oppdrag.betaling} perspektiv={state.rolle ?? 'mottaker'} />

          <section aria-labelledby="vilkar">
            <h2 id="vilkar" className="text-base font-bold text-navy">
              Vilkår
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {kontrakt.vilkar.map((v) => (
                <li key={v} className="flex gap-2 text-[0.9375rem] text-ink-2">
                  <Check size={17} className="mt-0.5 shrink-0 text-navy" strokeWidth={2.5} aria-hidden />
                  {v}
                </li>
              ))}
            </ul>
          </section>

          <dl className="grid gap-3 rounded-2xl bg-cream p-4 text-sm sm:grid-cols-2">
            {[
              [mottaker?.navn, oppdrag.betaling.reservert],
              [aktor?.navn, kontrakt.opprettet],
            ].map(([navn, tid]) => (
              <div key={navn}>
                <dt className="font-semibold text-ink">{navn}</dt>
                <dd className="tall text-ink-3">
                  Signert digitalt {datoMedAr(tid!)} kl. {klokkeslett(tid!)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </div>
  )
}
