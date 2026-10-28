import { ArrowRight, BadgeCheck, ClipboardPen, Sprout, UsersRound } from 'lucide-react'
import { Segl } from '../components/domain/Segl'
import { useNavigate } from 'react-router'
import ikon from '../assets/ikon-160.png'
import wordmark from '../assets/wordmark-lys.png'
import { useDemo } from '../store/context'
import type { Rolle } from '../types'

/** Demo-personen for ungdomsinngangen. */
const UNGDOM_DEMO = 'a-sander'

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
    // Aktørdøren går alltid til Kai, også etter at ungdomsinngangen er brukt.
    dispatch(rolle === 'aktor' ? { type: 'sett-persona', rolle, id: 'a-kai' } : { type: 'sett-rolle', rolle })
    navigate(rolle === 'mottaker' ? '/hjelp/ny' : '/aktor/jobber')
  }

  function velgUngdom() {
    dispatch({ type: 'sett-persona', rolle: 'aktor', id: UNGDOM_DEMO })
    navigate('/aktor/jobber')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <section data-mork className="relative flex-1 overflow-hidden bg-navy pt-[var(--sikker-topp,0px)] text-white">
        <div className="pointer-events-none absolute -right-24 -bottom-40 size-[34rem] rounded-[var(--radius-ikon)] bg-navy-700/40 rotate-12" aria-hidden />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center gap-7 px-4 pt-2 pb-10 sm:px-6">
          <div>
            <div className="flex items-center gap-4">
              <img src={ikon} alt="" className="size-14 rounded-[22%] shadow-loft sm:size-20" />
              <img src={wordmark} alt="Altmuligmannen" className="h-10 w-auto sm:h-16" />
            </div>
            <h1 className="mt-6 max-w-xl text-[2rem] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-5xl">
              Hjelp i hjemmet. Trygt betalt.
            </h1>
          </div>

          <div className="flex flex-col gap-4" role="group" aria-label="Velg hvordan du vil bruke Altmuligmannen">
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
            <button
              type="button"
              onClick={velgUngdom}
              className="group flex items-center gap-3 rounded-2xl px-5 py-3.5 text-left text-white ring-1 ring-white/25 transition-colors duration-200 hover:bg-white/6 sm:px-6"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber" aria-hidden>
                <Sprout size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold">Jeg er 15–17 år</span>
                <span className="block text-sm text-white/80">Hage, flytting og vask.</span>
              </span>
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              >
                <ArrowRight size={20} strokeWidth={2.2} />
              </span>
            </button>
          </div>
        </div>
      </section>

      <footer aria-labelledby="slik-tittel" className="shrink-0 px-4 pt-8 pb-[calc(var(--sikker-bunn,0px)+1rem)] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 id="slik-tittel" className="text-lg font-extrabold text-navy sm:text-2xl">
            Slik holdes pengene trygge
          </h2>
          <ol className="relative mt-4 grid grid-cols-4 gap-3">
            <span className="absolute top-6 right-[12.5%] left-[12.5%] h-0.5 bg-navy" aria-hidden />
            {STEG.map((s) => (
              <li key={s.tittel} className="relative flex flex-col items-center gap-2 text-center">
                {s.ikon ? (
                  <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-ikon)] bg-navy text-white ring-4 ring-cream" aria-hidden>
                    <s.ikon size={22} strokeWidth={1.9} />
                  </span>
                ) : (
                  <span className="animer-stempel rounded-[var(--radius-ikon)] ring-4 ring-cream">
                    <Segl storrelse={48} />
                  </span>
                )}
                <h3 className="font-display text-[0.8125rem] leading-tight font-bold text-navy sm:text-base">{s.tittel}</h3>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-center text-xs text-ink-3">Prototype · alle personer og data er fiktive</p>
        </div>
      </footer>
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
          : 'bg-white/6 text-white ring-1 ring-white/25 hover:bg-white/10'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-display text-xl font-extrabold tracking-tight sm:text-2xl">{tittel}</span>
        <span className={`mt-1 block text-[0.9375rem] ${hoved ? 'text-navy-900' : 'text-white/80'}`}>{tekst}</span>
      </span>
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:translate-x-0.5 ${
          hoved ? 'bg-navy text-amber' : 'bg-white/10 text-white'
        }`}
        aria-hidden
      >
        <ArrowRight size={20} strokeWidth={2.2} />
      </span>
    </button>
  )
}
