import { datoMedAr, kr } from '../../lib/format'
import type { Betaling, Rolle } from '../../types'
import { Segl } from './Segl'

const TEKST = {
  reservert: {
    mottaker: 'Frigis når du godkjenner jobben.',
    aktor: 'Sikret av kunden. Utbetales når jobben er godkjent.',
  },
  frigitt: {
    mottaker: 'Overført til aktøren.',
    aktor: 'Utbetalt til kontoen din.',
  },
}

/** Signaturkomponenten: viser hvor pengene er, med samme form på begge sider av appen. */
export function EscrowSegl({ betaling, perspektiv }: { betaling: Betaling; perspektiv: Rolle }) {
  const frigitt = betaling.status === 'frigitt'
  return (
    <section
      aria-label="Betalingsstatus"
      className={`flex gap-4 rounded-2xl p-4 ring-1 sm:p-5 ${frigitt ? 'bg-navy-50 ring-navy-100' : 'bg-amber-50 ring-amber/50'}`}
    >
      <span key={betaling.status} className="animer-stempel drop-shadow-[0_2px_3px_rgb(19_33_47/0.18)]">
        <Segl status={betaling.status} storrelse={56} />
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${frigitt ? 'text-navy-700' : 'text-amber-ink'}`}>
          {frigitt ? (perspektiv === 'aktor' ? 'Utbetalt' : 'Betaling frigitt') : 'Betaling reservert'}
        </p>
        <p className="tall font-display text-[1.75rem] leading-tight font-extrabold text-navy">{kr(betaling.belop)}</p>
        <p className="mt-1 text-sm text-ink-2">{TEKST[betaling.status][perspektiv]}</p>
        <p className="mt-2 text-xs text-ink-3">
          {frigitt && betaling.frigitt ? `Frigitt ${datoMedAr(betaling.frigitt)}` : `Reservert ${datoMedAr(betaling.reservert)}`}
        </p>
      </div>
    </section>
  )
}

export function EscrowMerke({ betaling }: { betaling: Betaling }) {
  const frigitt = betaling.status === 'frigitt'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg py-0.5 pr-2 pl-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${
        frigitt ? 'bg-navy-50 text-navy ring-navy-100' : 'bg-amber-100 text-amber-ink ring-amber/60'
      }`}
    >
      <Segl status={betaling.status} storrelse={20} />
      {frigitt ? 'Betaling frigitt' : 'Betaling reservert'}
      <span className="tall">· {kr(betaling.belop)}</span>
    </span>
  )
}
