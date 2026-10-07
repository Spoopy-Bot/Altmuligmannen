import { Check, X } from 'lucide-react'
import { dato, fornavn, klokkeslett, kr } from '../../lib/format'
import { finnPerson } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Hendelse, Oppdrag } from '../../types'

const REKKEFOLGE: Hendelse['type'][] = ['opprettet', 'forespurt', 'akseptert', 'startet', 'levert', 'godkjent', 'vurdert']


/**
 * Stemplet logg: ingenting forsvinner. Avslag står igjen som overstrøkne linjer,
 * og stegene som gjenstår vises dempet nedenfor.
 */
export function Hendelseslogg({ oppdrag }: { oppdrag: Oppdrag }) {
  const { state } = useDemo()
  const erAktor = state.rolle === 'aktor'
  const navn = (id?: string) => (id ? fornavn(finnPerson(state, id).navn) : 'Aktøren')
  const belop = kr(oppdrag.betaling.belop)

  const fremtid: Record<Hendelse['type'], string> = {
    opprettet: 'Beskriv oppdraget',
    forespurt: 'Send forespørsel',
    avslatt: '',
    akseptert: erAktor ? 'Du takker ja' : `${oppdrag.aktorId ? navn(oppdrag.aktorId) : 'Aktøren'} takker ja`,
    startet: 'Jobben utføres',
    levert: erAktor ? 'Du melder jobben ferdig' : `${navn(oppdrag.aktorId)} melder jobben ferdig`,
    godkjent: erAktor ? `${navn(oppdrag.mottakerId)} godkjenner, og du får ${belop}` : `Du godkjenner, og ${belop} frigis`,
    vurdert: 'Dere vurderer hverandre',
  }

  function tekst(h: Hendelse): string {
    switch (h.type) {
      case 'opprettet':
        return 'Oppdrag beskrevet, betaling reservert'
      case 'forespurt':
        return `Forespørsel sendt til ${navn(h.aktorId)}`
      case 'avslatt':
        return `${navn(h.aktorId)} hadde ikke kapasitet`
      case 'akseptert':
        return erAktor ? 'Du takket ja, kontrakt opprettet' : `${navn(h.aktorId)} takket ja, kontrakt opprettet`
      case 'startet':
        return 'Jobben startet'
      case 'levert':
        return erAktor ? 'Du meldte jobben ferdig' : `${navn(oppdrag.aktorId)} meldte jobben ferdig`
      case 'godkjent':
        return `Godkjent, ${belop} frigitt`
      case 'vurdert':
        return 'Vurdering gitt'
    }
  }

  const utfort = new Set(oppdrag.hendelser.map((h) => h.type))
  const gjenstar = REKKEFOLGE.filter(
    (t) => !utfort.has(t) && !(t === 'forespurt' && (utfort.has('akseptert') || oppdrag.status === 'apen')),
  )

  return (
    <ol className="relative flex flex-col" aria-label="Oppdragets historikk">
      {oppdrag.hendelser.map((h, i) => {
        const avslatt = h.type === 'avslatt'
        return (
          <li key={`${h.type}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
            <Strek />
            <span
              className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg ${
                avslatt ? 'bg-cream-200 text-ink-3 ring-1 ring-line-strong' : 'bg-navy text-cream'
              }`}
              aria-hidden
            >
              {avslatt ? <X size={13} strokeWidth={2.6} /> : <Check size={14} strokeWidth={3} />}
            </span>
            <div className="min-w-0">
              <p className={`text-[0.9375rem] font-medium ${avslatt ? 'text-ink-3 line-through decoration-ink-3/60' : 'text-ink'}`}>
                {tekst(h)}
              </p>
              <p className="tall text-xs text-ink-3">
                <time dateTime={h.tid}>
                  {dato(h.tid)} kl. {klokkeslett(h.tid)}
                </time>
              </p>
            </div>
          </li>
        )
      })}
      {gjenstar.map((t, i) => (
        <li key={t} className="relative flex gap-3 pb-5 last:pb-0">
          <Strek stiplet />
          <span
            className={`relative z-10 mt-0.5 size-6 shrink-0 rounded-lg ${
              i === 0 ? 'bg-navy-50 ring-2 ring-navy' : 'bg-white ring-1 ring-line-strong'
            }`}
            aria-hidden
          />
          <p className={`text-[0.9375rem] ${i === 0 ? 'font-semibold text-ink' : 'text-ink-3'}`}>
            {i === 0 && <span className="sr-only">Neste steg: </span>}
            {fremtid[t]}
          </p>
        </li>
      ))}
    </ol>
  )
}

function Strek({ stiplet }: { stiplet?: boolean }) {
  return (
    <span
      className={`absolute top-6 bottom-0 left-[11px] w-0.5 [li:last-child>&]:hidden ${
        stiplet ? 'bg-[repeating-linear-gradient(to_bottom,var(--color-line-strong)_0_4px,transparent_4px_8px)]' : 'bg-navy'
      }`}
      aria-hidden
    />
  )
}
