import { ArrowRight, BadgeCheck, ClipboardPen, UsersRound } from 'lucide-react'
import { Segl } from '../components/domain/Segl'
import { useNavigate } from 'react-router'
import ikon from '../assets/ikon-160.png'
import wordmark from '../assets/wordmark-lys.png'
import { useDemo } from '../store/context'
import type { Rolle } from '../types'

const STEG = [
  { ikon: ClipboardPen, tittel: 'Beskriv problemet' },
  { ikon: UsersRound, tittel: 'Velg blant tre anbefalte' },
  { ikon: null, tittel: 'Pengene reserveres' },
  { ikon: BadgeCheck, tittel: 'Frigis når du godkjenner' },
]

export function Start() {
  const { dispatch } = useDemo()
  const navigate = useNavigate()

  function velg(rolle: Rolle) {
    dispatch({ type: 'sett-rolle', rolle })
    navigate(rolle === 'mottaker' ? '/hjelp/ny' : '/aktor/jobber')
  }

  return (
    <div className="min-h-dvh bg-cream">
      <section data-mork className="relative overflow-hidden bg-navy text-cream">
        <div className="pointer-events-none absolute -right-24 -bottom-40 size-[34rem] rounded-[var(--radius-ikon)] bg-navy-700/40 rotate-12" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-8 pb-14 sm:px-6 sm:pt-12 md:grid-cols-[1.15fr_1fr] md:items-center md:pb-20">
          <div>
            <div className="flex items-center gap-4">
              <img src={ikon} alt="" className="size-16 rounded-[22%] shadow-loft sm:size-20" />
              <img src={wordmark} alt="Altmuligmannen" className="h-12 w-auto sm:h-16" />
            </div>
            <h1 className="mt-8 max-w-xl text-[2.125rem] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-5xl">
              Hjelp i hjemmet. Trygt betalt.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-navy-200">Folk i nærområdet ditt i Østfold.</p>
          </div>

          <div className="flex flex-col gap-3" role="group" aria-label="Velg hvordan du vil bruke Altmuligmannen">
            <RolleDor
              rolle="mottaker"
              tittel="Jeg trenger hjelp"
              tekst="Få hjelp fra folk i nærheten."
              onVelg={velg}
            />
            <RolleDor
              rolle="aktor"
              tittel="Jeg tilbyr hjelp"
              tekst="Finn betalte oppdrag nær deg."
              onVelg={velg}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="slik-tittel" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <h2 id="slik-tittel" className="text-2xl font-extrabold text-navy sm:text-3xl">
          Slik holdes pengene trygge
        </h2>
        <ol className="relative mt-10 grid gap-8 sm:grid-cols-4 sm:gap-4">
          <span className="absolute top-6 bottom-6 left-6 w-0.5 bg-navy sm:top-6 sm:right-[12.5%] sm:bottom-auto sm:left-[12.5%] sm:h-0.5 sm:w-auto" aria-hidden />
          {STEG.map((s) => (
            <li key={s.tittel} className="relative flex items-center gap-4 sm:flex-col sm:text-center">
              {s.ikon ? (
                <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-ikon)] bg-navy text-cream ring-4 ring-cream" aria-hidden>
                  <s.ikon size={22} strokeWidth={1.9} />
                </span>
              ) : (
                <span className="animer-stempel rounded-[var(--radius-ikon)] ring-4 ring-cream">
                  <Segl storrelse={48} />
                </span>
              )}
              <h3 className="font-display text-base font-bold text-navy">{s.tittel}</h3>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-sm text-ink-3">Prototype · alle personer og data er fiktive</p>
      </section>
    </div>
  )
}

function RolleDor({
  rolle,
  tittel,
  tekst,
  onVelg,
}: {
  rolle: Rolle
  tittel: string
  tekst: string
  onVelg: (r: Rolle) => void
}) {
  const hoved = rolle === 'mottaker'
  return (
    <button
      type="button"
      onClick={() => onVelg(rolle)}
      className={`group flex items-center gap-4 rounded-2xl p-5 text-left transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 sm:p-6 ${
        hoved
          ? 'bg-amber text-navy-950 shadow-loft hover:bg-amber-600'
          : 'bg-white/6 text-cream ring-1 ring-white/20 hover:bg-white/10'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-xl font-extrabold tracking-tight sm:text-2xl">{tittel}</span>
        <span className={`mt-1 block text-[0.9375rem] ${hoved ? 'text-navy-900' : 'text-navy-200'}`}>{tekst}</span>
      </span>
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:translate-x-0.5 ${
          hoved ? 'bg-navy text-amber' : 'bg-white/10 text-cream'
        }`}
        aria-hidden
      >
        <ArrowRight size={20} strokeWidth={2.2} />
      </span>
    </button>
  )
}
